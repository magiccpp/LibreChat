import React, { useState, useEffect, useCallback } from 'react';
import { useMessageProcess } from '~/hooks';
import type { TMessageProps } from '~/common';
import MessageRender from './ui/MessageRender';
// eslint-disable-next-line import/no-cycle
import MultiMessage from './MultiMessage';
import { useUpdateMessageRatingMutation } from 'librechat-data-provider/react-query';

const MessageContainer = React.memo(
  ({
    handleScroll,
    children,
  }: {
    handleScroll: (event?: unknown) => void;
    children: React.ReactNode;
  }) => {
    return (
      <div
        className="text-token-text-primary w-full border-0 bg-transparent dark:border-0 dark:bg-transparent"
        onWheel={handleScroll}
        onTouchMove={handleScroll}
      >
        {children}
      </div>
    );
  },
);

export default function Message(props: TMessageProps) {
  // Randomized positions for MessageRender instances
  const [renderOrder, setRenderOrder] = useState<number[]>([0, 1]);

  const {
    showSibling,
    conversation,
    handleScroll,
    siblingMessage,
    latestMultiMessage,
    isSubmittingFamily,
  } = useMessageProcess({ message: props.message });
  const { message, currentEditId, setCurrentEditId } = props;

  const [ratingArray, setRatingArray] = useState<number[]>([message?.rating || 0, siblingMessage?.rating || 0]);

  useEffect(() => {
    // Randomize the order on first mount
    setRenderOrder(Math.random() > 0.5 ? [0, 1] : [1, 0]);
  }, []);

  const updateMessageRatingMutation = useUpdateMessageRatingMutation(conversation?.conversationId ?? '');

  const updateMessageRating = useCallback(
    (messageId: string, rating: number) => {
      try {
        updateMessageRatingMutation.mutate({
          conversationId: conversation?.conversationId ?? '',
          messageId,
          rating,
        });
      } catch (error) {
        console.error('Failed to update message rating', error);
      }
    },
    [updateMessageRatingMutation],
  );

  const onMessageClick = (clickedMessage) => {
    const clickedMessageId = clickedMessage?.messageId;
    if (clickedMessageId === message?.messageId) {
      message && updateMessageRating(message.messageId, 1);
      const minRating = Math.min(ratingArray[1], 0);
      if (ratingArray[1] === 1) {
        siblingMessage && updateMessageRating(siblingMessage.messageId, 0);
      }
      setRatingArray([1,minRating]);
    } else {
      const minRating = Math.min(ratingArray[0], 0);
      if (ratingArray[0] === 1) {
        message && updateMessageRating(message.messageId, 0);
      }
      siblingMessage && updateMessageRating(siblingMessage.messageId, 1);

      setRatingArray([minRating,1]);
    }
  };

  const onRating = (ratedMessage, rating) => {
    ratedMessage && updateMessageRating(ratedMessage.messageId, rating);
    if (ratedMessage?.messageId === message?.messageId) {
      setRatingArray([rating, ratingArray[1]]);
    } else {
      setRatingArray([ratingArray[0], rating]);
    }
  };

  if (!message || typeof message !== 'object') {
    return null;
  }

  const { children, messageId = null } = message;

  const renderMessages = [
    {
      message: message,
      isMultiMessage: false,
    },
    {
      message: siblingMessage ?? latestMultiMessage ?? undefined,
      isMultiMessage: true,
    },
  ];

  return (
    <>
      <MessageContainer handleScroll={handleScroll}>
        {showSibling ? (
          <div className="m-auto my-2 flex justify-center p-4 py-2 md:gap-6">
            <div className="flex w-full flex-row flex-wrap justify-between gap-1 md:max-w-5xl md:flex-nowrap md:gap-2 lg:max-w-5xl xl:max-w-6xl">
              {renderOrder.map((order) => (
                <MessageRender
                  {...props}
                  {...renderMessages[order]}
                  isCard
                  isSubmittingFamily={isSubmittingFamily}
                  rating={ratingArray[order]}
                  onMessageClick={onMessageClick}
                  onRating={onRating}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="m-auto justify-center p-4 py-2 md:gap-6 ">
            <MessageRender
              {...props}
              rating={ratingArray[0]}
              onRating={onRating}
              onMessageClick={onMessageClick}
            />
          </div>
        )}
      </MessageContainer>
      <MultiMessage
        key={messageId}
        messageId={messageId}
        conversation={conversation}
        messagesTree={children ?? []}
        currentEditId={currentEditId}
        setCurrentEditId={setCurrentEditId}
      />
    </>
  );
}