// Index data
//
import { default as articles } from './articles';
import { default as replyrequests } from './replyrequests';
import { default as replyconnections } from './replyconnections';
import { default as replyconnectionfeedbacks } from './replyconnectionfeedbacks';

export const data = {
  articles,
  replyrequests,
  replyconnections,
  replyconnectionfeedbacks,
};

// Index replies
//
import { default as replyMapping } from './replies';
export const replies = { basic: replyMapping };

// Index tags
//
import { default as tagMapping } from './tags';
export const tags = { basic: tagMapping };

// Index users
//
import { default as userMapping } from './users';
export const users = { basic: userMapping };
