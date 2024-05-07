const username = "תשים פה את היוזר שלך";

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

    const userQueryRes = await fetch(
      `https://www.instagram.com/web/search/topsearch/?query=${username}`
    );

    const userQueryJson = await userQueryRes.json();

    const userId = userQueryJson.users.map(u => u.user)
                                      .filter(
                                        u => u.username === username
                                       )[0].pk;

    let after = null;
    let has_next = true;

    while (has_next) {
      await fetch(
        `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=` +
          encodeURIComponent(
            JSON.stringify({
              id: userId,
              include_reel: true,
              fetch_mutual: true,
              first: 50,
              after: after,
            })
          )
      )
        .then((res) => res.json())
        .then((res) => {
          has_next = res.data.user.edge_followed_by.page_info.has_next_page;
          after = res.data.user.edge_followed_by.page_info.end_cursor;
          followers = followers.concat(
            res.data.user.edge_followed_by.edges.map(({ node }) => {
              return {
                username: node.username,
                full_name: node.full_name,
              };
            })
          );
        });
    }


    after = null;
    has_next = true;

    while (has_next) {
      await fetch(
        `https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=` +
          encodeURIComponent(
            JSON.stringify({
              id: userId,
              include_reel: true,
              fetch_mutual: true,
              first: 50,
              after: after,
            })
          )
      )
        .then((res) => res.json())
        .then((res) => {
          has_next = res.data.user.edge_follow.page_info.has_next_page;
          after = res.data.user.edge_follow.page_info.end_cursor;
          followings = followings.concat(
            res.data.user.edge_follow.edges.map(({ node }) => {
              return {
                username: node.username,
                full_name: node.full_name,
              };
            })
          );
        });
    }


    dontFollowMeBack = followings.filter((following) => {
      return !followers.find(
        (follower) => follower.username === following.username
      );
    });

    console.log({ dontFollowMeBack });

    iDontFollowBack = followers.filter((follower) => {
      return !followings.find(
        (following) => following.username === follower.username
      );
    }).filter(user=>user.username!=="oshridagan");


    console.log(
      `remember 'copy(dontFollowMeBack)' to copy the list`
    );
  } catch (err) {
    console.log({ err });
  }
})();
