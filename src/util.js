export const KEY = 'airing_is_good#20171101@ursb.me';

export function checkToken(uid, timestamp, token) {
  return token === md5(uid.toString() + timestamp.toString() + KEY)
}
