import { apiGetCall, apiPostCall } from "./helpers.js";

// get this channel's messages
// return a Promise will be handled later on
const getMsgsByChannelId = (channelId, start) => {
  return apiGetCall(`message/${channelId}?start=${start}`, true);
};

const messages = { getMsgsByChannelId };

export default messages;
