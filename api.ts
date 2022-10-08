import axios from "axios";
import momentTimezone from 'moment-timezone';

import { v4 as uuid } from "uuid";

const axiosInstance = axios.create({
  baseURL: "https://api.dev.prohabits.com/v1",
  headers: { "X-Request-Token": uuid() },
});

const parseQuery = (query: string): { uid: string, token: string } => {
  const vars = query.split('&') as Array<any>;
  const query_string = {} as any;
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=') as Array<any>;
    // If first entry with this name
    if (typeof query_string[pair[0]] === 'undefined') {
      query_string[pair[0]] = decodeURIComponent(pair[1])
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === 'string') {
      const arr = [query_string[pair[0]], decodeURIComponent(pair[1])]
      query_string[pair[0]] = arr
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]))
    }
  }
  return query_string
}

export const fetchAccessToken = async (email: string) => {
  try {
    const res1 = await axiosInstance.get(`users/ms-teams/${email}`);
    const parsed = parseQuery(Buffer.from(res1.data, 'base64').toString()) as { uid: string, token: string };
    console.log('__parsed__', parsed);
    const res2 = await axiosInstance.post('auth/login', {
      email: parsed.uid,
      timezone: momentTimezone.tz.guess(),
      token: parsed.token,
    })
    console.log('__res2__', res2);
    axiosInstance.defaults.headers.common.Authorization = `JWT ` + res2.data.access_token;
    return res2.data
  } catch (error) {
    console.log("__ERROR__fetchAccessToken__", error)
  }
};

export const sendActivityAction = async (data: {
  actionType: "commit" | "did",
  actionSource: "mst",
  activityId: number,
  userActivityId: number
}) => {
  console.log('__data__', JSON.stringify(data));
  try {
    // looks like here we must create separate instance and make commit with different token
    const res = await axiosInstance.post('protrack-levels-progress', data);
    return res.data;
  } catch (error) {
    console.log("__ERROR__sendActivityAction__", error)
  }
}
