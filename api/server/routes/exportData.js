const express = require('express');
const router = express.Router();
const bypassAuth = (req, res, next) => next();
const requireJwtAuth = require('~/server/middleware/requireJwtAuth');
const { getConvosByPage } = require('~/models/Conversation');
const { getMessages } = require('~/models');


// Helper function to build tree from messages
function buildMessageTree(messages) {
  // Create a map of messages by ID for easy lookup
  const messageMap = new Map();
  let root = null;

  // First pass: create nodes and populate the map
  messages.forEach(message => {
    messageMap.set(message.messageId, {
      ...message,
      children: []
    });
  });

  // Second pass: build the tree structure
  messages.forEach(message => {
    const node = messageMap.get(message.messageId);

    if (message.parentMessageId === "00000000-0000-0000-0000-000000000000") {
      root = node;
    } else {
      const parentNode = messageMap.get(message.parentMessageId);
      if (parentNode) {
        parentNode.children.push(node);
      }
    }
  });

  return root;
}

function findLongestPath(node, currentPath = []) {
  if (!node) return [];

  currentPath = [...currentPath, node];

  // If this is a leaf node, return current path
  if (node.children.length === 0) {
      return currentPath;
  }

  let bestPath = currentPath;
  let bestRating = bestPath[bestPath.length - 1].rating || 0; // Get rating of last node

  // Check all child paths
  node.children.forEach(child => {
      const childPath = findLongestPath(child, currentPath);
      const childRating = childPath[childPath.length - 1].rating || 0;

      // Update best path if:
      // 1. Child path is longer, OR
      // 2. Child path is same length but has higher rating
      if (childPath.length > bestPath.length ||
          (childPath.length === bestPath.length && childRating > bestRating)) {
          bestPath = childPath;
          bestRating = childRating;
      }
  });

  return bestPath;
}

function convertToOpenAIFormat(longestPath, noGreetings) {
  if (!noGreetings) {
    return longestPath.map(message => ({
      role: message.isCreatedByUser ? "user" : "assistant",
      content: message.text
    }));
  }

  const filteredPath = [];
  let skipNext = false;

  for (const message of longestPath) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    if (message.isCreatedByUser && message.text.length < 10 && /hi|hello/i.test(message.text)) {
      skipNext = true; // Skip the next (assistant) message
    } else {
      filteredPath.push({
        role: message.isCreatedByUser ? "user" : "assistant",
        content: message.text
      });
    }
  }

  return filteredPath;
}

router.get('/', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    // check if there is the query parameter 'no_greetings'
    const noGreetings = req.query.no_greetings || true;
    let allConvos = [];
    const resp = await getConvosByPage(userId, 1, 100, false)
    allConvos = allConvos.concat(resp.conversations);
    if (resp.pages > 1) {
      for (let i = 2; i <= resp.pages; i++) {
        const resp = await getConvosByPage(userId, i, 100, false)
        allConvos = allConvos.concat(resp.conversations);
      }
    }

    let allOpenAIMessages = [];
    for (let i = 0; i < allConvos.length; i++) {
      const convo = allConvos[i];
      const conversationId = convo.conversationId;
      const messages = (await getMessages({ conversationId })) ?? [];
      const tree = buildMessageTree(messages);
      const longestPath = findLongestPath(tree);
      const openAIMessages = convertToOpenAIFormat(longestPath, noGreetings);
      console.log(openAIMessages);
      if (openAIMessages.length > 0) {
        allOpenAIMessages.push({messages: openAIMessages});
      }

    }

    res.status(200).json(allOpenAIMessages);

  } catch (e) {
    console.log(e);
    res.status(500).json('Error counting stats');
  }
})

// Add this line at the end of the file
module.exports = router;