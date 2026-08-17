# Decisions

The code shows what got built. It does not show the problem it was built against,
the insight it rests on, or what got cut to protect that insight. This is that.

## The problem

Not "people cannot find Jupiter's moons." That is solved, well, by several free
products.

The real problem is that someone who has seen the four-dots diagram a hundred
times still cannot tell you why Io vanishes every forty two hours, or why it
always vanishes at the same point in its orbit. Seen from Earth, eclipses,
occultations, transits and shadow transits arrive as four unrelated event types
in a table. You look them up. You memorise them. You never understand them.

Who that matters to: readers who already know Jupiter has four large moons and
want the mechanics rather than the trivia. Amateur observers planning a session.
Science-curious people who bounce off almanac tables and give up.

## The insight

Move the observer to Jupiter and those four event types collapse into one
variable.

A moon is eclipsed exactly when it is full, because both mean the same thing:
it is on the anti-solar side. A moon casts a shadow exactly when it is new.
There is nothing left to memorise. The phase *is* the prediction.

That reframing is not reachable from the Earth view at any level of polish. It is
the entire reason this exists, and every decision below exists to protect it.

## What success looks like

Not page views. The outcome is a reader who arrives not knowing the relationship
and leaves able to predict it. If they can look at Io at 99 per cent lit and say
"then it is about to be eclipsed," the product worked.

Everything on the page was judged against that sentence. Anything that displayed
data without advancing it lost its place.

## Assumptions, and which were actually tested

**Tested.** That the physics holds and is reproducible: 75 checks against a
published worked example, an independent Kepler solution, and invariants that
must hold identically. That the relationship survives contact with real geometry:
verified across 200 days, and Callisto's exceptions turned out to be the most
interesting part rather than a problem with the claim. That the rendering
communicates phase truthfully: this one failed the first time.

**Not tested.** That anyone wants this. There are no users and no demand signal.
It got built because the question was interesting, and dressing that up as
validated need would be a lie. That the printed-ephemeris framing reads as
intended to anyone other than me.

## Two things I got wrong

**The first build was generic.** Dark dashboard, rounded cards, coloured accent
rails. The data was correct and it taught nothing, because it looked like every
other dashboard and so carried no signal about what kind of object it was. It got
rebuilt around a printed astronomical ephemeris, which is the form this data has
actually taken for four centuries. That was not decoration. A reader who
recognises a reference document reads it differently than one who sees a
dashboard, and the reading is the product.

**The renderer lied.** Io displayed "3.3 per cent lit" beside a nearly full disk,
because the night-side glow was forty times too strong. Every number on the page
was already correct. Only the picture was wrong, and no test caught it because
every test was checking arithmetic. It was found by looking at the output and
refusing to accept it.

The general lesson is that correct and comprehensible are different problems, and
only one of them has a test suite. The fix moved the calculation into the tested
block so the image and the arithmetic can no longer diverge.

## What got cut, and the rule

The rule: does it make the phase relationship clearer? If not, it competes with
it for attention and it goes.

**The other ninety one moons.** Irregular, kilometres across, no phenomenon
visible from the cloud tops. A longer list and no insight.

**Mutual events**, where one moon eclipses another. Genuinely interesting and
genuinely beyond a theory good to 0.1 Jupiter radii. Predicting them badly is
worse than not predicting them.

**A thirty day event window.** Io alone produces four phenomena a day, so a week
already fills forty rows. Thirty days needs search, filters and pagination. That
is a different product, and building it would have meant solving a problem nobody
had yet.

**A live ephemeris API.** JPL Horizons is far more accurate, and the accuracy is
not what this reader lacks. Taking it would have added a backend, a key, a rate
limit and somebody else's uptime, in exchange for precision the use case does not
need. The ceiling is stated on the page instead of hidden.

**A light theme.** The plates are photometric. Inverting them is physically
wrong, and a light page wrapped around black plates got built and read as an
accident rather than a choice.

**Mobile-first layout.** A dense reference sheet. It reflows and stays legible on
a phone, but it was laid out for a desktop the way an almanac page is laid out
for paper.

## What is still open

Continuous integration. The suite runs on demand but nothing enforces it on push,
so a reader has to take the number on faith. That is a gap, not a decision.

And the honest one: there is still no evidence that anyone wants this. The next
real step is not a feature. It is putting it in front of ten amateur astronomers
and finding out whether the reframing lands, or whether I have built something
that is only interesting to the person who built it.
