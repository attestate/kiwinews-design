# Notifications: grouped likes and reactions with avatars (web)

kiwistand branch `claude/notif-like-avatars`. Rendered on the local fixture
server (scripts/pagespeed/local.mjs), mobile 390px and desktop 1280px,
light and dark. CLS 0 on all eight.

- `demo-*`: the /activity page rendered with a demo feed (a story liked by
  12 people, 3 reactions to a comment, 2 and 1 likers, a comment), to show
  the full avatar row; the avatars are the fixture's, people without one get
  the person placeholder.
- `fixture-*`: /activity of the fixture's kiwireader02.eth as it is seeded.

## Farcaster reference

Farcaster client (`apps/farcaster-web/src/components/notifications/`),
`CastReactionNotificationGroup`: one row per cast for all its likes.

- Left: a red heart icon (`NotificationIcon variant="red"`).
- Then `NotificationAvatars`: up to 8 distinct likers (`uniqBy fid`), newest
  first, small round avatars 4px apart (`ml-1`), no overlap, each linking to
  the profile.
- Then `NotificationGroupUserNames`: "<first name> and 1 other / N others
  liked your cast", the name bold and linking to the profile, the "others"
  linking to the list of actors.
- Then `NotificationGroupCastText`: the cast's text, two lines, in the muted
  (secondary) colour.
- The whole row links to the cast (an absolute cover link under the avatar
  and name links). Mobile (`farcaster-mobile` `NotificationGroupHeading`) is
  the same layout.

Kiwi: the heart mark stays ours (heart with "+1 🥝" on mobile, the icon box
on desktop, voted colour); faces are 24px; the headline reads "<newest> and
N others liked your story"; reactions to a comment are grouped the same way
with "reacted to your comment 🔥 😂" and the comment's text. Kiwi has no
list-of-likers page, so "N others" is plain text and the row goes to the
story.
