const express = require('express');
const router = express.Router();
const { logger } = require('~/config');
const requireJwtAuth = require('~/server/middleware/requireJwtAuth');
const bypassAuth = (req, res, next) => next();
const { getConvosByPage } = require('~/models/Conversation');
const { getMessages } = require('~/models');

function getKFactor(rating) {
  if (rating < 2100) {
      return 40; // New or developing players
  } else if (rating < 2400) {
      return 20; // Established players
  } else {
      return 10; // Highly experienced players
  }
}

function getActualScore(points_scored, points_opponent) {
  const max_points = Math.max(points_scored, points_opponent)
  const point_margin = max_points > 0 ? (points_scored - points_opponent) / max_points : 0
  return 0.5 + 0.5 * point_margin
}

function updateModelPoint(currentELORating, opponentELORating, matchPoint, opponentMatchPoint) {
  // Validate inputs
  if (typeof currentELORating !== 'number' || 
      typeof matchPoint !== 'number' || 
      typeof opponentMatchPoint !== 'number') {
    throw new Error('Invalid input: All arguments must be numbers');
  }

  // Get K-factor based on current rating
  const K = getKFactor(currentELORating);

  // Calculate expected score
  const expectedScore = 1 / (1 + 10 ** ((opponentELORating - currentELORating) / 400));

  // Calculate actual score (binary outcome)
  const actualScore = getActualScore(matchPoint, opponentMatchPoint);
  // Calculate new rating
  const newELORating = Math.round(
    currentELORating + K * (actualScore - expectedScore)
  );

  return newELORating;
}

router.get('/', requireJwtAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    let allConvos = [];
    const resp = await getConvosByPage(userId, 1, 100, false)
    allConvos = allConvos.concat(resp.conversations);
    if (resp.pages > 1) {
      for (let i = 2; i <= resp.pages; i++) {
        const resp = await getConvosByPage(userId, i, 100, false)
        allConvos = allConvos.concat(resp.conversations);
      }
    }
    
    // go through all cpnversations and each conversation is a match.
    let modelELORatings = {};
    let modelPlayedMatches = {}
    const initialPoints = 1500;
    for (let i = 0; i < allConvos.length; i++) {
      const convo = allConvos[i];
      const conversationId = convo.conversationId;
      const messages = (await getMessages({ conversationId })) ?? [];
      let modelMatchPoints = {}
      
      for (let j = 0; j < messages.length; j++) {
        const message = messages[j];
        if (!message.model) {
          continue;
        }
        
        // Add the model to the allModels array if not already present
        if (!modelELORatings[message.model]) {
          modelELORatings[message.model] = initialPoints;
        }

        if (!modelPlayedMatches[message.model]) {
          modelPlayedMatches[message.model] = 0;
        }

        if (modelMatchPoints[message.model]) {
          modelMatchPoints[message.model] + message.rating;
        } else {
          modelMatchPoints[message.model] = message.rating;
        }
      }

      // Update the model's points using ELO algorithm if there is 2 models in modelRatings
      if (Object.keys(modelMatchPoints).length === 2) {
        const model1 = Object.keys(modelMatchPoints)[0];
        const model2 = Object.keys(modelMatchPoints)[1];
        const curELORating1 = modelELORatings[model1];
        const curELORating2 = modelELORatings[model2];
        const matchPoint1 = modelMatchPoints[model1];
        const matchPoint2 = modelMatchPoints[model2];
        modelELORatings[model1] = updateModelPoint(curELORating1, curELORating2, matchPoint1, matchPoint2);
        modelELORatings[model2] = updateModelPoint(curELORating2, curELORating1, matchPoint2, matchPoint1);
        modelPlayedMatches[model1]++;
        modelPlayedMatches[model2]++;
      }
    }

    let resultArray = Object.keys(modelELORatings).map(model => ({
      model: model,
      rating: modelELORatings[model],
      matches: modelPlayedMatches[model]
    }));

    return res.status(200).json(resultArray);
  } catch (e) {
    res.status(500).json('Error counting stats');
  }
});

module.exports = router;
