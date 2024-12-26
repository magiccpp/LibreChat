import { useRecoilValue } from 'recoil';
import React, { useState } from 'react';
import { useCallback, useMemo, memo } from 'react';
import type { TMessage } from 'librechat-data-provider';
import type { TMessageProps } from '~/common';
import MessageContent from '~/components/Chat/Messages/Content/MessageContent';
import PlaceholderRow from '~/components/Chat/Messages/ui/PlaceholderRow';
import SiblingSwitch from '~/components/Chat/Messages/SiblingSwitch';
import HoverButtons from '~/components/Chat/Messages/HoverButtons';
import Icon from '~/components/Chat/Messages/MessageIcon';
import { Plugin } from '~/components/Messages/Content';
import SubRow from '~/components/Chat/Messages/SubRow';
import { MessageContext } from '~/Providers';
import { useMessageActions } from '~/hooks';
import { cn, logger } from '~/utils';
import store from '~/store';
import { useAddedChatContext, useChatContext } from '~/Providers';

type MessageRenderProps = {
  message?: TMessage;
  isCard?: boolean;
  isMultiMessage?: boolean;
  isSubmittingFamily?: boolean;
  rating: number;
  onMessageClick: (message: TMessage) => void;
  onRating: (message: TMessage, rating: number) => void;
} & Pick<
  TMessageProps,
  'currentEditId' | 'setCurrentEditId' | 'siblingIdx' | 'setSiblingIdx' | 'siblingCount'
>;

const MessageRender = memo(
  ({
    isCard,
    siblingIdx,
    siblingCount,
    message: msg,
    setSiblingIdx,
    currentEditId,
    isMultiMessage,
    setCurrentEditId,
    isSubmittingFamily,
    rating,
    onMessageClick,
    onRating,
  }: MessageRenderProps) => {
    const {
      ask,
      edit,
      index,
      assistant,
      enterEdit,
      conversation,
      messageLabel,
      isSubmitting,
      latestMessage,
      handleContinue,
      copyToClipboard,
      setLatestMessage,
      regenerateMessage,
    } = useMessageActions({
      message: msg,
      currentEditId,
      isMultiMessage,
      setCurrentEditId,
    });

    const {
      conversation: addedConvo,
    } = useAddedChatContext();

    const { isBlindMode } = useChatContext();
    const fontSize = useRecoilValue(store.fontSize);
    const handleRegenerateMessage = useCallback(() => regenerateMessage(), [regenerateMessage]);
    const { isCreatedByUser, error, unfinished } = msg ?? {};
    const hasNoChildren = !(msg?.children?.length ?? 0);
    const isLast = useMemo(
      () => hasNoChildren && (msg?.depth === latestMessage?.depth || msg?.depth === -1),
      [hasNoChildren, msg?.depth, latestMessage?.depth],
    );

    if (!msg) {
      return null;
    }

    const isLatestMessage = msg.messageId === latestMessage?.messageId;
    const showCardRender = isLast && !(isSubmittingFamily === true) && isCard === true;
    const isLatestCard = isCard === true && !(isSubmittingFamily === true) && isLatestMessage;
    const clickHandler =
      showCardRender
        ? () => {
          logger.log(`Message Card click: Setting ${msg.messageId} as latest message`);
          logger.dir(msg);
          onMessageClick && onMessageClick(msg);
          setLatestMessage(msg);
        }
        : undefined;

    // Determine if the text should be blurred
    const shouldHideText  = messageLabel === msg.sender && isBlindMode && addedConvo !== null;
    return (
      <div
        aria-label={`message-${msg.depth}-${msg.messageId}`}
        className={cn(
          'final-completion group mx-auto flex flex-1 gap-3',
          isCard === true
            ? 'relative w-full gap-1 rounded-lg border border-border-medium bg-surface-primary-alt p-2 md:w-1/2 md:gap-3 md:p-4'
            : 'md:max-w-3xl md:px-5 lg:max-w-[40rem] lg:px-1 xl:max-w-[48rem] xl:px-5',
          isLatestCard === true ? 'bg-surface-secondary' : '',
          showCardRender ? 'cursor-pointer transition-colors duration-300' : '',
          'focus:outline-none focus:ring-2 focus:ring-border-xheavy',
        )}
        onClick={clickHandler}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && clickHandler) {
            clickHandler();
          }
        }}
        role={showCardRender ? 'button' : undefined}
        tabIndex={showCardRender ? 0 : undefined}
      >
        {isLatestCard === true && (
          <div className="absolute right-0 top-0 m-2 h-3 w-3 rounded-full bg-text-primary"></div>
        )}
        <div className="relative flex flex-shrink-0 flex-col items-end">
          <div>
            <div className="pt-0.5">
              {!shouldHideText && ( // Only render if shouldHideText is false
                <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
                  <Icon message={msg} conversation={conversation} assistant={assistant} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className={cn(
            'relative flex w-11/12 flex-col',
            msg.isCreatedByUser === true ? '' : 'agent-turn',
          )}

        >
          {!shouldHideText && ( // Only render if shouldHideText is false
            <h2 className={cn('select-none font-semibold', fontSize)}>
              {messageLabel}
            </h2>
          )}
          <div className="flex-col gap-1 md:gap-3">
            <div className="flex max-w-full flex-grow flex-col gap-0">
              <MessageContext.Provider
                value={{
                  messageId: msg.messageId,
                  conversationId: conversation?.conversationId,
                }}
              >
                {msg.plugin && <Plugin plugin={msg.plugin} />}
                <MessageContent
                  ask={ask}
                  edit={edit}
                  isLast={isLast}
                  text={msg.text || ''}
                  message={msg}
                  enterEdit={enterEdit}
                  error={!!(error ?? false)}
                  isSubmitting={isSubmitting}
                  unfinished={unfinished ?? false}
                  isCreatedByUser={isCreatedByUser ?? true}
                  siblingIdx={siblingIdx ?? 0}
                  setSiblingIdx={setSiblingIdx ?? (() => ({}))}
                />
              </MessageContext.Provider>
            </div>
          </div>
          {hasNoChildren && (isSubmittingFamily === true || isSubmitting) ? (
            <PlaceholderRow isCard={isCard} />
          ) : (
            <SubRow classes="text-xs">
              <SiblingSwitch
                siblingIdx={siblingIdx}
                siblingCount={siblingCount}
                setSiblingIdx={setSiblingIdx}
              />
              <HoverButtons
                index={index}
                isEditing={edit}
                message={msg}
                enterEdit={enterEdit}
                isSubmitting={isSubmitting}
                conversation={conversation ?? null}
                regenerate={handleRegenerateMessage}
                copyToClipboard={copyToClipboard}
                handleContinue={handleContinue}
                latestMessage={latestMessage}
                isLast={isLast}
                rating={rating}
                onRating={onRating}
              />
            </SubRow>
          )}
        </div>
      </div>
    );
  },
);

export default MessageRender;
