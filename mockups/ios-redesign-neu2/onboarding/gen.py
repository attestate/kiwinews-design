"""Builds HTML mockups of the restyled iOS onboarding (values from
KiwiNative/Screens/OnboardingView.swift and Core/Theme.swift)."""
import os, re, sys

IOS = "/home/user/kiwi-ios-neu2"
A = IOS + "/KiwiNews/Assets.xcassets"
OUT = sys.argv[1]


def svg(name):
    d = os.path.join(A, name + ".imageset")
    f = [x for x in os.listdir(d) if x.endswith(".svg")][0]
    s = open(os.path.join(d, f)).read()
    s = re.sub(r'\swidth="[^"]*"', "", s, count=1)
    s = re.sub(r'\sheight="[^"]*"', "", s, count=1)
    s = re.sub(r"\sfill=\"[^\"]*\"", "", s)
    return s.replace("<svg ", '<svg fill="currentColor" ', 1)


FONTS = "".join(
    f"@font-face{{font-family:Inter;font-weight:{w};src:url(file://{IOS}/KiwiNative/Fonts/Inter-{n}.ttf)}}"
    for w, n in [(400, "Regular"), (500, "Medium"), (600, "SemiBold"), (700, "Bold")]
)

THEMES = {
    "light": dict(page="#F8F9F4", tp="#10131D", ts="#78818A", tm="#858D94", accent="#D4EC37",
                  strong="#ADC724", btnbg="rgba(0,0,0,.08)", track="#EEEFEA", surface="#FFFFFF",
                  alert="#FF0000", border="#E6E9DF", brown="#55391B", green="#ADC724"),
    "dark": dict(page="#191D17", tp="#F4F6EF", ts="#B3BCAE", tm="#ABB5A5", accent="#D4EC37",
                 strong="#D4EC37", btnbg="rgba(255,255,255,.12)", track="#2E3529", surface="#2C3328",
                 alert="#FF6B6B", border="#414B38", brown="#D9965A", green="#D4EC37"),
}

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{width:393px;height:852px;background:var(--page);font-family:Inter;color:var(--tp);overflow:hidden;-webkit-font-smoothing:antialiased}
.status{height:47px;display:flex;align-items:center;justify-content:space-between;padding:0 30px 0 40px;font-weight:600;font-size:17px}
.top{display:flex;align-items:center;justify-content:space-between;padding:8px 20px 0;min-height:52px}
.dashes{display:flex;gap:4px}.dashes i{width:18px;height:4px;border-radius:2px;background:var(--btnbg)}.dashes i.on{background:var(--strong)}
.close{color:var(--strong);font-size:17px}
.body{padding:20px;display:flex;flex-direction:column;gap:16px}
.tile{width:48px;height:48px;border-radius:6px;background:var(--accent);color:#000;display:flex;align-items:center;justify-content:center;margin-bottom:4px}
.tile svg{width:26px;height:26px}
h1{font-size:34px;font-weight:700;line-height:1.2;letter-spacing:-.4px}
.head{display:flex;flex-direction:column;gap:12px}
.head p{font-size:17px;line-height:24px;color:var(--ts)}
.green{height:44px;border-radius:6px;background:var(--accent);color:#000;font-weight:500;font-size:16px;display:flex;align-items:center;justify-content:center}
.green.off{background:var(--btnbg);color:var(--tm);border:1px solid var(--border)}
.outlined{height:44px;border-radius:6px;background:var(--surface);border:1px solid var(--ts);color:var(--tp);font-weight:500;font-size:16px;display:flex;align-items:center;justify-content:center}
.skip{min-height:44px;display:flex;align-items:center;justify-content:center;color:var(--ts);font-size:16px}
.rules{display:flex;flex-direction:column;gap:10px}.rules b{font-size:17px;font-weight:600}
.rules div{display:flex;gap:8px;font-size:15px;line-height:20px;color:var(--ts)}
.rules .links{display:flex;gap:20px;color:var(--strong);font-size:15px;min-height:44px;align-items:center}
.field{min-height:50px;border-radius:6px;background:var(--track);display:flex;align-items:center;padding:0 16px;font-size:17px;justify-content:space-between}
.field.mono{font-family:ui-monospace,"DejaVu Sans Mono",Menlo,monospace}
.field.bad{outline:1px solid var(--alert)}
.field .ph{color:var(--tm)}.field svg{width:20px;height:20px;color:var(--tm)}
.helper{display:flex;gap:6px;align-items:center;font-size:15px;color:var(--ts);margin-top:-8px}.helper svg{width:16px;height:16px}
.helper.bad{color:var(--alert)}
.avatar{position:relative;width:112px;height:112px;margin-bottom:4px}
.avatar .c{width:112px;height:112px;border-radius:50%;background:var(--btnbg);display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:600;color:var(--ts)}
.avatar .c.photo{background:radial-gradient(circle at 35% 30%,#f6d38b,#c47a3d 55%,#5b3a1e)}
.avatar .b{position:absolute;right:0;bottom:0;width:36px;height:36px;border-radius:50%;background:var(--accent);color:#000;box-shadow:0 0 0 3px var(--page);display:flex;align-items:center;justify-content:center}
.avatar .b svg{width:18px;height:18px}
.statusrow{display:flex;gap:12px;padding:8px 0}.spin{width:20px;height:20px;border-radius:50%;border:2px solid var(--btnbg);border-top-color:var(--ts);margin-top:2px}
.statusrow b{font-size:17px;font-weight:600;display:block;margin-bottom:4px}.statusrow span{font-size:15px;line-height:20px;color:var(--ts)}
.logo{display:flex;align-items:center;gap:11px;margin-bottom:8px}.logo img{width:40px;height:40px}
.wm{position:relative;width:154px;height:22.5px}.wm svg{position:absolute;inset:0;width:100%;height:100%}
"""


def head(title, *ps):
    return '<div class="head"><h1>' + title + "</h1>" + "".join(f"<p>{p}</p>" for p in ps) + "</div>"


def tile(n):
    return f'<div class="tile">{svg(n)}</div>'


RULES = [
    "No objectionable, abusive, hateful, sexual, violent or illegal content.",
    "No harassment, ad hominem attacks, spam or shilling.",
    "Everything you post is public, signed with your key and shared across Kiwi nodes; it can't be edited.",
    "Report posts, comments and people from their \"…\" menu, or block them. We review reports within 24 hours and remove violating content and accounts.",
]

ONETAP = head("Enable<br>one-tap actions",
              "So you don't have to confirm every like and comment in your wallet, Kiwi&nbsp;News creates a key on this&nbsp;iPhone.",
              "Your wallet approves it once with a free&#8209;of&#8209;value transaction on Optimism (only network fees&nbsp;apply).",
              "No funds are&nbsp;moved.")

PAGES = {
    "welcome": (1, False,
        f'<div class="logo"><img src="file://{A}/KiwiIcon.imageset/kiwi-icon@3x.png"><div class="wm">'
        f'<span style="color:var(--brown)">{svg("WordmarkKiwi")}</span><span style="color:var(--green)">{svg("WordmarkNews")}</span></div></div>'
        + head("Welcome to Kiwi&nbsp;News", "Handpicked links for builders, engineers and crypto researchers, curated and discussed by the&nbsp;community.")
        + '<div class="rules"><b>Community rules</b>' + "".join(f"<div><span>•</span><span>{r}</span></div>" for r in RULES)
        + '<div class="links"><span>Terms &amp; Guidelines</span><span>Privacy Policy</span></div></div>'
        + '<div class="green">I agree, continue</div><div class="skip">I agree, just browse for now</div>'),
    "join": (2, True, tile("OnbPersonAdd")
        + head("Join Kiwi News", "Create an account in a few seconds. You don't need a wallet or a seed&nbsp;phrase.", "Reading never needs an account.")
        + '<div class="green">Create account</div><div class="outlined">Sign in</div><div class="skip">I have my own wallet</div>'),
    "nickname-available": (3, True, tile("OnbNickname")
        + head("Pick a nickname", "This is how others see you on Kiwi News. You can change it later in Settings.")
        + f'<div class="field mono"><span>satoshi</span>{svg("OnbClear")}</div>'
        + f'<div class="helper"><span style="color:var(--strong);display:flex">{svg("OnbCheck")}</span>Available</div>'
        + '<div class="green">Create account</div>'),
    "nickname-taken": (3, True, tile("OnbNickname")
        + head("Pick a nickname", "This is how others see you on Kiwi News. You can change it later in Settings.")
        + f'<div class="field mono bad"><span>vitalik</span>{svg("OnbClear")}</div>'
        + f'<div class="helper bad">{svg("OnbError")}That name is taken. Try another one.</div>'
        + '<div class="green off">Create account</div>'),
    "profile-picture": (4, True,
        f'<div class="avatar"><div class="c">S</div><div class="b">{svg("OnbCamera")}</div></div>'
        + head("Add a profile picture", "Optional. It shows next to your stories and comments. You can add one later.")
        + '<div class="green">Choose photo</div><div class="skip">Skip</div>'),
    "profile-picture-chosen": (4, True,
        f'<div class="avatar"><div class="c photo"></div><div class="b">{svg("OnbEdit")}</div></div>'
        + head("Add a profile picture", "This picture shows next to your stories and comments. You can change it anytime in Settings.")
        + '<div class="green">Save</div><div class="skip">Skip</div>'),
    "one-tap-actions": (3, True, tile("OnbTouch") + ONETAP
        + '<div class="green">Approve in wallet</div><div class="skip">Not now</div>'),
    "one-tap-actions-confirming": (3, True, tile("OnbTouch") + ONETAP
        + '<div class="statusrow"><div class="spin"></div><div><b>Confirm in your&nbsp;wallet</b><span>Approve the transaction in your wallet app, then come&nbsp;back.</span></div></div>'
        + '<div class="skip">Not now</div>'),
    "notifications": (5, True, tile("OnbNotifications")
        + head("Get notified", "We'll only notify you when someone likes your story or replies to&nbsp;you.", "No marketing, and you can turn it off anytime in&nbsp;Settings.")
        + '<div class="green">Turn on notifications</div><div class="skip">Not now</div>'),
    "email": (5, True, tile("OnbMail")
        + head("Replies by email", "Optional: get an email when someone replies to your comments or&nbsp;stories.")
        + '<div class="field"><span class="ph">Email</span></div><div class="green off">Subscribe</div><div class="skip">Skip</div>'),
    "done": (5, True, tile("OnbVerified")
        + head("You're all set!", "Your account is ready. Like, comment and submit stories right away.")
        + '<div class="green">Start reading</div>'),
}

os.makedirs(OUT, exist_ok=True)
for theme, t in THEMES.items():
    vars_ = ";".join(f"--{k}:{v}" for k, v in t.items())
    for slug, (filled, close, content) in PAGES.items():
        dashes = "".join(f'<i class="{"on" if i < filled else ""}"></i>' for i in range(5))
        html = (f"<!doctype html><html><head><meta charset=utf-8><style>{FONTS}:root{{{vars_}}}{CSS}</style></head><body>"
                f'<div class="status"><span>9:41</span><span></span></div>'
                f'<div class="top"><div class="dashes">{dashes}</div>{"<span class=close>Close</span>" if close else ""}</div>'
                f'<div class="body">{content}</div></body></html>')
        name = slug + ("" if theme == "light" else "-dark")
        open(os.path.join(OUT, name + ".html"), "w").write(html)
print("ok")
