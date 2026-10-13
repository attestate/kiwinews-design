"""HTML mockup of the #40 feed (Home · Hot) with main's picture layout:
link previews 2.4:1 with 8pt corners, uploads at their own ratio (max
320pt tall), pictures 23pt from the screen edge (20pt row margin + 3pt
pictureInset), as in KiwiNative/UI/StoryRow.swift and FeedView.swift."""
import os, re, sys

IOS = "/home/user/kiwi-ios-neu2"
A = IOS + "/KiwiNews/Assets.xcassets"
OUT = sys.argv[1]


def svg(name, stroke_current=True):
    d = os.path.join(A, name + ".imageset")
    f = [x for x in os.listdir(d) if x.endswith(".svg")][0]
    s = open(os.path.join(d, f)).read()
    s = re.sub(r'\swidth="[^"]*"', "", s, count=1)
    s = re.sub(r'\sheight="[^"]*"', "", s, count=1)
    s = s.replace('stroke="#000000"', 'stroke="currentColor"').replace('fill="#000000"', 'fill="currentColor"')
    if 'fill="currentColor"' not in s and 'stroke="currentColor"' not in s:
        s = s.replace("<svg ", '<svg fill="currentColor" ', 1)
    return s


FONTS = "".join(
    f"@font-face{{font-family:{fam};font-weight:{w};src:url(file://{IOS}/KiwiNative/Fonts/{fam.replace(' ', '')}-{n}.ttf)}}"
    for fam in ("Inter", "JetBrains Mono")
    for w, n in [(400, "Regular"), (500, "Medium"), (600, "SemiBold"), (700, "Bold")]
)

THEMES = {
    "light": dict(page="#F8F9F4", tp="#10131D", ts="#78818A", tt="#606971", tm="#858D94", accent="#D4EC37",
                  strong="#ADC724", vote="#737E85", track="#EEEFEA", glass="rgba(255,255,255,.96)",
                  glassb="rgba(0,0,0,.06)", sep="rgba(60,60,67,.29)", strip="#F4F5EF", tabsel="#EEF6C8",
                  brown="#55391B", green="#ADC724", btnbg="rgba(0,0,0,.08)",
                  pic1="linear-gradient(135deg,#2b4162 0%,#385f71 45%,#d7b377 100%)",
                  pic2="linear-gradient(160deg,#8fb996 0%,#4f7c5a 55%,#1f3b2c 100%)"),
    "dark": dict(page="#191D17", tp="#F4F6EF", ts="#B3BCAE", tt="#C1C9BA", tm="#ABB5A5", accent="#D4EC37",
                 strong="#D4EC37", vote="#B8C3AF", track="#2E3529", glass="rgba(41,49,36,.96)",
                 glassb="rgba(255,255,255,.1)", sep="rgba(84,84,88,.6)", strip="#30372A", tabsel="#47541A",
                 brown="#D9965A", green="#D4EC37", btnbg="rgba(255,255,255,.12)",
                 pic1="linear-gradient(135deg,#2b4162 0%,#385f71 45%,#d7b377 100%)",
                 pic2="linear-gradient(160deg,#8fb996 0%,#4f7c5a 55%,#1f3b2c 100%)"),
}

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{width:393px;background:var(--page);font-family:Inter;color:var(--tp);-webkit-font-smoothing:antialiased;overflow:hidden}
.mono{font-family:"JetBrains Mono"}
.status{height:47px;display:flex;align-items:center;padding:0 40px;font-weight:600;font-size:17px}
.nav{display:flex;align-items:center;justify-content:space-between;padding:4px 20px 8px}
.gb{width:44px;height:44px;border-radius:8px;background:var(--glass);border:1px solid var(--glassb);box-shadow:0 2px 8px rgba(0,0,0,.06);display:flex;align-items:center;justify-content:center}
.gb svg{width:20px;height:20px}
.logo{display:flex;align-items:center;gap:8px}.logo img{width:29px;height:29px}
.wm{position:relative;width:112px;height:16.33px}.wm span{position:absolute;inset:0}.wm svg{width:100%;height:100%}
.seg{margin:12px 20px 0;height:32px;border-radius:6px;background:var(--track);display:flex;padding:2px}
.seg div{flex:1;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;border-radius:5px}
.seg .on{background:#D4EC37;color:#000}
.row{margin:0 20px;padding:16px 0 12px;border-bottom:.5px solid var(--sep)}
.pic{margin:0 3px;border-radius:8px;overflow:hidden}
.preview{aspect-ratio:2.4/1}
.texts{display:flex;flex-direction:column;gap:5px}
.pic + .texts{margin-top:12px}
.dl{height:20px;display:flex;align-items:center;gap:7px;font-size:11px}
.rank{color:var(--tm);font-weight:500}.dom{color:var(--tt)}
.title{font-size:17px;font-weight:600;line-height:22px}
.sub{display:flex;align-items:center;gap:7px;color:var(--ts);font-size:12px}
.av{width:24px;height:24px;border-radius:50%;background:var(--btnbg)}
.sub .mono{font-size:11px}.sub .who{color:var(--tt)}
.acts{display:flex;margin-top:8px;margin-bottom:4px;color:var(--vote);font-size:12px}
.acts>div{flex:1;min-height:44px;display:flex;align-items:center;gap:6px}
.acts>div:last-child{justify-content:flex-end}
.acts svg{width:20px;height:20px}
.cp{background:var(--strip);border-radius:4px;padding:9px;display:flex;gap:10px}
.cp .av{width:28px;height:28px}.cp .n{font-size:11px;color:var(--tt)}.cp .t{font-size:13px;margin-top:3px}
.tab{position:fixed;left:16px;right:16px;bottom:24px;height:62px;border-radius:8px;background:var(--glass);border:1px solid var(--glassb);box-shadow:0 4px 16px rgba(0,0,0,.08);display:flex;padding:4px}
.tab div{flex:1;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:10px;font-weight:500}
.tab .on{background:var(--tabsel)}
.tab svg{width:22px;height:22px}
"""

ICONS = {'Home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z"/></svg>', 'New': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="2"/><path d="M8 8a5.5 5.5 0 0 0 0 8M16 8a5.5 5.5 0 0 1 0 8M5.2 5.2a9.5 9.5 0 0 0 0 13.6M18.8 5.2a9.5 9.5 0 0 1 0 13.6"/></svg>', 'Submit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 4H5v15h15v-7"/><path d="M17.5 3.5l3 3L12 15H9v-3z"/></svg>', 'Notifications': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21h4"/></svg>'}
BOOKMARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M6 3.5h12v17l-6-4.2-6 4.2z"/></svg>'
MENU = '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/></svg>'


def acts(likes, comments):
    return (f'<div class="acts mono"><div>{svg("IconHeart")}{likes}</div><div>{svg("IconComments")}{comments}</div>'
            f'<div>{svg("IconShare")}</div><div>{BOOKMARK}</div></div>')


def row(rank, domain, title, who, ago, likes, comments, pic=None, comment=None):
    p = ""
    if pic == "preview":
        p = '<div class="pic preview" style="background:var(--pic1)"></div>'
    elif pic == "upload":
        # FeedImageLayout: full width at the picture's own ratio (4:3 here), max 320pt tall.
        p = '<div class="pic" style="height:260.25px;background:var(--pic2)"></div>'
    c = ""
    if comment:
        c = (f'<div class="cp"><div class="av"></div><div><div class="n mono">{comment[0]} • {comment[1]} ago</div>'
             f'<div class="t">{comment[2]}</div></div></div>')
    return (f'<div class="row">{p}<div class="texts"><div class="dl mono"><span class="rank">{rank:02d}</span>'
            f'<span class="dom">{domain}</span></div><div class="title">{title}</div>'
            f'<div class="sub"><div class="av"></div><span class="mono who">{who}</span>•<span class="mono">{ago}</span></div></div>'
            f'{acts(likes, comments)}{c}</div>')


def page(theme, tabbar=True):
    t = THEMES[theme]
    vars_ = ";".join(f"--{k}:{v}" for k, v in t.items())
    body = (
        '<div class="status">9:41</div>'
        f'<div class="nav"><div class="gb">{MENU}</div><div class="logo"><img src="file://{A}/KiwiIcon.imageset/kiwi-icon@3x.png">'
        f'<div class="wm"><span style="color:var(--brown)">{svg("WordmarkKiwi")}</span><span style="color:var(--green)">{svg("WordmarkNews")}</span></div></div>'
        f'<div class="gb">{SEARCH}</div></div>'
        '<div class="seg"><div class="on">Hot</div><div>New</div><div>Best</div></div>'
        + row(1, "vitalik.eth.limo", "Vitalik: a roadmap for making Ethereum’s L1 quantum resistant", "rvolz.eth", "6h", 7, 3, pic="preview")
        + row(2, "ethereum.org", "Introducing zkAPI: private usage credits for any API", "mishaderidder.eth", "8h", 2, 4,
              comment=("timdaub.eth", "2h", "Really useful approach to privacy."))
        + row(3, "kiwistand.com", "Our booth at Devconnect, day one", "timdaub.eth", "3h", 12, 2, pic="upload")
    )
    if tabbar:
        body += ('<div class="tab">' + ''.join(f'<div class="{"on" if n == "Home" else ""}">{ICONS[n]}{n}</div>' for n in ICONS) + '</div>')
    return f"<!doctype html><html><head><meta charset=utf-8><style>{FONTS}:root{{{vars_}}}{CSS}</style></head><body>{body}</body></html>"


os.makedirs(OUT, exist_ok=True)
for theme in THEMES:
    open(os.path.join(OUT, f"home-hot{'' if theme == 'light' else '-dark'}.html"), "w").write(page(theme))
# The What's new picture: the top of the light feed, no tab bar.
open(os.path.join(OUT, "whatsnew-picture.html"), "w").write(page("light", tabbar=False).replace("<div class=\"status\">9:41</div>", "<div style=\"height:4px\"></div>"))
print("ok")
