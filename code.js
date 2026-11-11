const username = "היוזר ניים שלך";

const IG_HEADERS = {
  "x-ig-app-id": "936619743392459",
  "x-asbd-id": "359341",
  "x-requested-with": "XMLHttpRequest",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


async function getUserId(uname) {
  const res = await fetch(`https://www.instagram.com/${uname}/`, {
    credentials: "include",
  });
  const html = await res.text();
  const match = html.match(/"profile_id":"(\d+)"/);
  if (!match) {
    throw new Error(`Couldn't find user id for "${uname}" (HTTP ${res.status})`);
  }
  return match[1];
}

let followers = [{ username: "", full_name: "" }];
let followings = [{ username: "", full_name: "" }];
let dontFollowMeBack = [{ username: "", full_name: "" }];
let iDontFollowBack = [{ username: "", full_name: "" }];

followers = [];
followings = [];
dontFollowMeBack = [];
iDontFollowBack = [];

(async () => {
  try {
    console.log(`STARTING TO FETCH`);

    const userId = await getUserId(username);

    let max_id = null;
    let has_next = true;

    while (has_next) {
      await fetch(
        `https://www.instagram.com/api/v1/friendships/${userId}/followers/?count=50${
          max_id ? `&max_id=${encodeURIComponent(max_id)}` : ""
        }`,
        { credentials: "include", headers: IG_HEADERS }
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.status !== "ok") throw new Error(JSON.stringify(res));
          max_id = res.next_max_id || null;
          has_next = Boolean(max_id) && res.has_more !== false;
          followers = followers.concat(
            res.users.map((u) => {
              return {
                username: u.username,
                full_name: u.full_name,
              };
            })
          );
        });
    }

    max_id = null;
    has_next = true;

    while (has_next) {
      await fetch(
        `https://www.instagram.com/api/v1/friendships/${userId}/following/?count=50${
          max_id ? `&max_id=${encodeURIComponent(max_id)}` : ""
        }`,
        { credentials: "include", headers: IG_HEADERS }
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.status !== "ok") throw new Error(JSON.stringify(res));
          max_id = res.next_max_id || null;
          has_next = Boolean(max_id) && res.has_more !== false;
          followings = followings.concat(
            res.users.map((u) => {
              return {
                username: u.username,
                full_name: u.full_name,
              };
            })
          );
        });
    }

    dontFollowMeBack = followings.filter((following) => {
      return !followers.find(
        (follower) => follower.username === following.username
      );
    }).filter((user)=>user.username!==username);;

    console.log({ dontFollowMeBack });

    iDontFollowBack = followers.filter((follower) => {
      return !followings.find(
        (following) => following.username === follower.username
      );
    })


    console.log(
      `remember 'copy(dontFollowMeBack)' to copy the list`
    );
  } catch (err) {
    console.log({ err });
  }
})();
