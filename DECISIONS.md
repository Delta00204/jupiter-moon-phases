# Decisions

The code shows what got built. It does not show the problem it was built against,
the insight it rests on, or what got cut to protect that insight. This is that.

## The problem

Astronomy and aerospace enthusiasts are not short of data. They are short of
places to stand.

Every planetarium tool answers the same question: where are Jupiter's moons
tonight, seen from here. That question is solved, and solved well, by several
free products. None of them offer the view from inside the system, which is what
someone who actually cares about the Jovian system is reaching for. Not where the
moons are. What it is like there.

The gap shows up as memorisation. People who have followed this for years can
quote the event times and still carry eclipses, occultations, transits and shadow
transits as four separate things to look up. From Earth they genuinely are four
separate things. The tools teach lookup because the vantage point leaves them no
other option.

Who this is for: people who already care. Amateur observers planning a session.
Students heading into aerospace. Planetarium visitors who wanted more than the
show gave them. Anyone whose interest in this system has outrun what a table can
feed it.

This started as a conversation with an enthusiast at the ICR Discovery Center in
Dallas. He could name the moons and quote the event times, and he still described
the system as something he had memorised rather than somewhere he could picture
himself standing. That was the signal worth chasing: the data is freely available
and the sense of the place is not. One conversation is where a problem comes
from, not proof that it generalises, and the rest of this document treats it that
way.

## The insight

Move the observer to Jupiter and the table stops being necessary.

From there, a moon is eclipsed exactly when it is full, because both mean the
same thing: it is on the anti-solar side. It casts a shadow exactly when it is
new. Four kinds of event collapse into one thing you can simply look at. Nothing
is left to memorise, because the picture already carries the prediction.

That is not a rendering trick, and it is not reachable from Earth at any level of
polish, because from Earth those events really are unrelated. The vantage point
is the product. Everything below exists to protect it.

## What success looks like

Not page views, and not accuracy for its own sake. The outcome is an enthusiast
who arrives able to look things up and leaves able to picture the system running.

The concrete test: they see Io at 99 per cent lit and say "then it is about to go
into eclipse," without being told and without reaching for anything. If they go
looking for a table instead, this failed, however correct the table is.

Everything on the page was judged against that sentence. Anything that added data
without moving someone closer to it lost its place.

## Assumptions, and which were actually tested

**Tested.** That the physics holds and is reproducible: 75 checks against a
published worked example, an independent Kepler solution, and invariants that
must hold identically. That the relationship survives contact with real geometry:
verified across 200 days, and Callisto's exceptions turned out to be the most
interesting part rather than a problem with the claim. That the rendering
communicates phase truthfully: this one failed the first time.

**Not tested.** That the gap generalises beyond the one person who described it.
A single conversation is an origin, not a demand signal, and treating n = 1 as
validation is the easiest mistake available here. Nobody has used the finished
thing and reported back. Nor has anyone confirmed that the printed-ephemeris
framing reads as intended to anyone other than me.

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

The rule: does it help someone picture the system from the inside? Anything that
only adds data is competing for attention with the thing that does, and it goes.

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

And the honest one: this rests on a single conversation. The next real step is not
a feature. It is putting the page in front of ten more people who fit that
description, asking whether it changes how they would explain an eclipse to a
beginner, and finding out whether the reframing lands or whether it only ever
landed for the two of us.
