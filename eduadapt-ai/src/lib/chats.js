export function groupChats(chats, now = Date.now()) {
  const day = 86400000;
  const groups = { Today: [], "Previous 7 days": [], Older: [] };
  [...chats].sort((a, b) => b.updatedAt - a.updatedAt).forEach((chat) => {
    const age = now - chat.updatedAt;
    (age < day ? groups.Today : age < 7 * day ? groups["Previous 7 days"] : groups.Older).push(chat);
  });
  return Object.entries(groups).filter(([, list]) => list.length);
}
