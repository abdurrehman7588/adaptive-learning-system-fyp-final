# Curriculum blueprint — adaptive learning catalog

**Version:** 1.0 (approved taxonomy)  
**Status:** Content planning only — **not** implemented in database or application code.  
**Source spec:** [07-adaptive-content-foundation.md](../specs/07-adaptive-content-foundation.md)

---

## How this document maps to the quiz catalog

| Blueprint concept | Future `Quiz` / `QuizQuestion` field |
|-------------------|--------------------------------------|
| Grade band | `Quiz.gradeLevel` (`GradeLevel` enum) |
| Category column in tables below | `Quiz.category` (`LearningCategory` enum) — **one per quiz** |
| Topic | `QuizQuestion.topic` and/or quiz `title` / `description` |
| Difficulty band | `Quiz.difficultyLevel` (default) + optional `QuizQuestion.difficultyLevel` override |
| Example questions | Seed/import into `questionText` + four `QuizQuestionOption` rows |

**Catalog design rule:** Prefer **one quiz per topic per difficulty tier** (e.g. “Grade 2 · Pattern Recognition · Repeating Colors · Easy”) rather than mixing Easy/Medium/Hard in a single quiz, so `difficultyLevel` stays honest at quiz level.

**Question format (MVP):** Multiple choice, 4 options, one correct — matches current player.

---

## Grade-band overview

| Grade | Typical age | Cognitive focus | Language / stem length |
|-------|-------------|-----------------|------------------------|
| Pre-K | 4 | Concrete, visual, oral-friendly | Very short stems; pictures/emojis encouraged |
| Kindergarten | 5 | Counting 1–10, basic shapes/colors | Short stems; heavy scaffolding |
| Grade 1 | 6 | Addition/subtraction within 10, living things | Short sentences |
| Grade 2 | 7 | Addition/subtraction within 100, matter intro | 1–2 sentence stems |
| Grade 3 | 8 | Multiplication intro, habitats, maps | 2 sentence stems |
| Grade 4 | 9 | Multi-digit ops, energy, data tables | Multi-step allowed |
| Grade 5 | 10 | Fractions/decimals, ecosystems, variables | Reasoning with tables |
| Grade 6 | 11–12 | Ratios, cells, formal logic | Abstract + real-world context |

---

## Table of contents

1. [Pre-K](#pre-k)  
2. [Kindergarten](#kindergarten)  
3. [Grade 1](#grade-1)  
4. [Grade 2](#grade-2)  
5. [Grade 3](#grade-3)  
6. [Grade 4](#grade-4)  
7. [Grade 5](#grade-5)  
8. [Grade 6](#grade-6)  
9. [Catalog population checklist](#catalog-population-checklist)

---

# Pre-K

*GradeLevel: `pre_k` · Ages ~4*

---

## Pre-K · Math (`math`)

### Topics
- Counting 1–5 (objects, fingers)
- Same vs different (size, color)
- Big / small, more / less
- Shapes: circle, square, triangle
- Patterns with colors (AB)

### Learning objectives
- Count up to 5 objects with one-to-one correspondence.
- Compare two groups as “more” or “less” (≤5 items).
- Name basic shapes in everyday objects.
- Continue a two-color repeating pattern (AB).
- Match numerals 1–3 to quantities.

### Question examples

**Easy**  
1. How many apples? 🍎🍎🍎 → (3 | 2 | 4 | 5)  
2. Which shape is a circle? (🔵 circle pic | ■ | ▲ | ⭐)

**Medium**  
1. Which group has **more**? (●● vs ●) → first group  
2. What comes next? 🔴🔵🔴___ → 🔵

**Hard**  
1. Count: 🐸🐸🐸🐸 — how many frogs? (4 | 3 | 5 | 2)  
2. Which is **different**? (🔴🔴🔵🔴) → blue circle position

---

## Pre-K · Science (`science`)

### Topics
- Five senses (see, hear, touch, smell, taste)
- Weather: sunny, rainy, cold, hot
- Plants need water and light
- Animals: pets vs wild (simple)
- Day and night

### Learning objectives
- Link senses to body parts (eyes → see).
- Name today’s weather from pictures.
- Identify what plants need to grow.
- Sort animals into pet / not pet with support.
- Recognize day sky vs night sky.

### Question examples

**Easy**  
1. We use our ___ to see. (eyes | ears | nose | hands)  
2. ☀️ means it is ___. (sunny | snowy | windy | foggy)

**Medium**  
1. Plants need ___ to grow. (water | toys | sleep | paint)  
2. Which is a **pet**? (🐕 dog | 🦁 lion | 🐘 elephant | 🦈 shark)

**Hard**  
1. At **night** the sky is usually ___. (dark | rainbow | green | loud)  
2. Which helps us **hear**? (ears | eyes | feet | hair)

---

## Pre-K · Pattern Recognition (`pattern_recognition`)

### Topics
- Color patterns (AB, AAB)
- Size patterns (big-small-big)
- Sound patterns (clap-stomp-clap) — described in text
- Picture patterns (animal-object-animal)
- Finish the pattern (2-step)

### Learning objectives
- Copy a pattern with blocks or pictures.
- Extend AB color patterns by one unit.
- Describe a pattern using “again” / “next.”
- Distinguish pattern vs random arrangement.
- Create a simple AB pattern with two colors.

### Question examples

**Easy**  
1. 🔴🔵🔴🔵___ → 🔴 or 🔵 (correct: 🔴)  
2. ▲●▲●___ → ▲

**Medium**  
1. 🟡🟡🔵🟡🟡🔵___ → 🟡 (AAB continuation)  
2. BIG-small-BIG-small-___ → BIG

**Hard**  
1. 🐶⭐🐶⭐🐶___ → ⭐  
2. Which row is a **pattern**? (ABAB row | random row) — identify structured row

---

## Pre-K · Memory (`memory`)

### Topics
- Picture pairs (match same object)
- Remember 2 items in a scene
- Sequence of 2 pictures (first → next)
- Same/different picture memory
- “What was missing?” (one item removed)

### Learning objectives
- Match identical pictures from memory after brief view.
- Recall two objects from a simple scene.
- Order two events (wash hands: soap → rinse).
- Notice when one familiar item disappears from a set.
- Repeat a two-item list (cup, spoon).

### Question examples

**Easy**  
1. Which two are the **same**? (🍌🍌 among distractors)  
2. Find the matching pair: (two identical cats shown)

**Medium**  
1. You saw: 🧸 and 🍎. Which was there? (both options vs distractors)  
2. First we put on shoes, then we go ___. (outside | sleep | cook | swim)

**Hard**  
1. Scene had: ball, book, cup. **Book** was removed. Which is missing? (book)  
2. Remember: cat, hat. Which two? (cat+hat vs mixed distractors)

---

## Pre-K · Sequencing (`sequencing`)

### Topics
- Daily routine: wake → eat → play
- First / next / last (3 pictures)
- Growing plant stages (seed → sprout) simplified
- Size order (shortest to tallest, 3 items)
- Story order (3 panels)

### Learning objectives
- Put two routine pictures in order.
- Use words first and next correctly.
- Order three pictures of a sprouting plant.
- Line up three objects by height.
- Retell a 3-step picture story in order.

### Question examples

**Easy**  
1. Wake up → ___ → play. (eat breakfast | sleep again | drive | mail)  
2. 1️⃣ 2️⃣ 3️⃣ — what comes **first**? (picture 1)

**Medium**  
1. Seed → ___ → small plant. (water/sun picture | dinosaur | moon)  
2. Short → medium → ___ (tall stick figure)

**Hard**  
1. Order: coat on → zip coat → go outside. What is **last**? (go outside)  
2. Which picture belongs in the **middle** of brushing teeth story?

---

## Pre-K · Problem Solving (`problem_solving`)

### Topics
- Simple puzzles (where does piece fit?)
- Tool for job (cup for drink)
- Obstacle detour (go around)
- Share one snack fairly (2 friends)
- Which container fits? (big toy → big box)

### Learning objectives
- Choose a reasonable tool for a need.
- Solve “how to get there” with one detour.
- Share equally between two (one each).
- Select correct outline puzzle piece.
- Pick container size that fits object.

### Question examples

**Easy**  
1. You are thirsty. Use a ___. (cup | pillow | shoe | book)  
2. Road blocked — go ___ it. (around | through wall | under ground | fly)

**Medium**  
1. Two friends, one cookie each. How many cookies needed? (2 | 1 | 3 | 0)  
2. Big ball goes in ___ box. (big | tiny | flat | broken)

**Hard**  
1. Crayon rolled under table. Best action? (walk around to get it | erase table | eat crayon)  
2. Which piece **fits** the puzzle hole? (shape match)

---

## Pre-K · Critical Thinking (`critical_thinking`)

### Topics
- Which does not belong? (category)
- True or silly (ice is hot — silly)
- Why questions with picture choices
- Same function (both for eating)
- Safe vs unsafe (touch stove)

### Learning objectives
- Exclude one item from a set of four by category.
- Identify silly vs real statements with pictures.
- Choose best reason from two picture options.
- Group objects by what they do.
- Recognize basic unsafe choices.

### Question examples

**Easy**  
1. Not a fruit: 🍎 🍌 🚗 🍇 → 🚗  
2. Silly: Ice is ___. (cold | hot | wet | hard) — hot is silly

**Medium**  
1. Which two are for **eating**? (fork+spoon vs ball+block)  
2. Why wear a coat? (stay warm | grow taller | turn blue)

**Hard**  
1. Which is **unsafe**? (touch hot stove pic | wash hands pic)  
2. Which does **not** belong: all animals except 🌳 tree?

---

## Pre-K · Visual Reasoning (`visual_reasoning`)

### Topics
- Left / right (on self)
- Above / below
- Front / behind (simple)
- Mirror/same direction (arrow point same way)
- Complete simple picture (missing half shape)

### Learning objectives
- Point to left vs right hand.
- Place object above or below a line.
- Identify who is in front in a picture.
- Match arrow direction in two grids.
- Complete symmetric simple shape.

### Question examples

**Easy**  
1. The bird is ___ the box. (on top | inside soup | under bed — on top)  
2. Point to your ___ hand. (left | right — either if labeled in image; stem uses picture)

**Medium**  
1. Cat is ___ the table. (under | flying | eating math)  
2. Arrow points → — find same → arrow

**Hard**  
1. Which shows person **behind** the chair? (select correct pic)  
2. Complete the square: missing ___ corner piece

---

# Kindergarten

*GradeLevel: `kindergarten` · Ages ~5*

---

## Kindergarten · Math (`math`)

### Topics
- Counting 1–20
- Comparing numbers (more/less/equal to 10)
- Addition within 5 (objects)
- Subtraction within 5 (take away)
- 2D shapes attributes (sides, corners)

### Learning objectives
- Count objects to 20 with accuracy.
- Compare written numerals within 10 using >, <, = in words.
- Solve join problems within 5 with pictures.
- Solve take-away problems within 5.
- Describe shapes by sides and vertices.

### Question examples

**Easy**  
1. What comes after 7? (8 | 6 | 9 | 5)  
2. 3 + 2 = ? (5 | 4 | 6 | 3)

**Medium**  
1. 5 − 2 = ? (3 | 2 | 4 | 7)  
2. Which has **equal** amount? (●●● and ●●●)

**Hard**  
1. 4 + ___ = 7 (3 | 2 | 4 | 1)  
2. A square has ___ sides. (4 | 3 | 5 | 6)

---

## Kindergarten · Science (`science`)

### Topics
- Living vs nonliving
- Animal needs (food, water, shelter)
- Seasons and weather patterns
- Human body basics (heart beats, lungs breathe)
- Reduce/reuse/recycle intro

### Learning objectives
- Classify objects as living or nonliving.
- State three needs of animals.
- Match season to typical weather/clothing.
- Identify body parts used for breathing.
- Sort items into recycle vs trash (simple).

### Question examples

**Easy**  
1. A rock is ___. (nonliving | living | hungry | growing)  
2. Animals need ___. (food | paint | music | shadows)

**Medium**  
1. In winter it is often ___. (cold | always hot | never cloudy)  
2. We breathe with our ___. (lungs | shoes | hair | pencils)

**Hard**  
1. Which is **living**? (seedling | toy car | table | book)  
2. Which season do we wear coats most? (winter | summer | — context temperate)

---

## Kindergarten · Pattern Recognition (`pattern_recognition`)

### Topics
- Growing patterns (+1 dot each row)
- Shape patterns (△□△□)
- Number patterns 2,4,6
- Translate pattern to new colors
- Pattern rule in words (“add one”)

### Learning objectives
- Extend shape and color patterns with 3+ terms.
- Describe the rule of a simple growing pattern.
- Continue counting patterns by 2s to 10.
- Copy a pattern using different media.
- Identify mistake in a broken pattern.

### Question examples

**Easy**  
1. △□△□___ → △  
2. 2,4,6,___ → 8

**Medium**  
1. 🔴🔴🔵🔴🔴🔵___ → 🔴 (AAB)  
2. Which breaks the pattern? (one wrong tile in row)

**Hard**  
1. Growing: ●, ●●, ●●●, ___ → ●●●●  
2. Rule “one more each time” — next count? 3,4,5,___ → 6

---

## Kindergarten · Memory (`memory`)

### Topics
- Remember 3 objects
- Order of three nursery images
- Match faces to names (3)
- Missing object from tray (4 items)
- Repeat pattern after delay

### Learning objectives
- Recall three items after 10-second delay.
- Reorder three story pictures.
- Associate three simple names with faces.
- Identify removed item from four on a tray.
- Reproduce a three-color pattern from memory.

### Question examples

**Easy**  
1. Match: two identical 🌸 flowers hidden in grid  
2. Which was in the picture: 🎈? (yes/no set)

**Medium**  
1. Saw 🐶 🍎 🚗 — pick all three from six icons  
2. Story: plant seed → water → sun. What was **second**? (water)

**Hard**  
1. Tray had spoon, fork, cup, plate. **Fork** removed — which missing?  
2. Pattern 🔴🔵🟢 shown 5 sec — what was second color?

---

## Kindergarten · Sequencing (`sequencing`)

### Topics
- Morning routine (4 steps)
- Life cycle butterfly (egg-caterpillar-chrysalis-butterfly) simplified
- Ordinal words 1st–4th
- Time words: before/after
- Build a sandwich sequence

### Learning objectives
- Sequence four daily-routine images.
- Order butterfly life stages with labels.
- Use ordinal names through fourth.
- Place events before/after in a story.
- Explain one step that happens between two given steps.

### Question examples

**Easy**  
1. Brush teeth → ___ → eat. (wake | sleep | drive) — wake first context  
2. 1st, 2nd, 3rd — which is **third**? (pic C)

**Medium**  
1. Egg → caterpillar → ___ → butterfly (chrysalis/pupa image)  
2. Put on socks **before** shoes. True or false? (True)

**Hard**  
1. Four-step hand washing — which step is **last**? (dry hands)  
2. What happens **between** planting seed and seeing flower? (stem grows)

---

## Kindergarten · Problem Solving (`problem_solving`)

### Topics
- Trial and error tower build
- Choose strategy: draw vs count
- Combine two groups for total
- Fair share among three
- Pattern fix (find wrong piece)

### Learning objectives
- Try two approaches and pick better outcome.
- Represent a word problem with objects.
- Solve simple combine problems within 10.
- Distribute items fairly among three children.
- Correct an error in a physical pattern.

### Question examples

**Easy**  
1. 2 red balls and 3 blue balls. How many **total**? (5 | 4 | 6)  
2. Three friends, 3 stickers each. Stickers needed? (9 | 6 | 3)

**Medium**  
1. Bridge too short — what can we do? (use longer plank | jump to moon)  
2. Missing pattern tile — which piece fixes it?

**Hard**  
1. You have 7 grapes, eat 2. How many left? (5 | 6 | 4)  
2. Two ways to make 6: 3+3 and ___+2 (4)

---

## Kindergarten · Critical Thinking (`critical_thinking`)

### Topics
- Odd one out (function/category)
- Fact vs opinion (I like…)
- Cause and effect (rain → wet)
- Better choice (rain → umbrella)
- Question the picture (can fish live on land?)

### Learning objectives
- Justify odd-one-out with one reason.
- Distinguish fact from preference statement.
- Link cause to plausible effect.
- Choose tool suited to weather problem.
- Answer “can it happen?” about nature pictures.

### Question examples

**Easy**  
1. Odd one: 🐟 🐠 🐡 🚌 → 🚌  
2. Fact: Dogs have ___. (tails | purple fur always)

**Medium**  
1. It rained. Ground is ___. (wet | dry | on fire)  
2. Best for rain: (umbrella | sunglasses)

**Hard**  
1. Why did plant wilt? Best answer: (no water | no music)  
2. Which **opinion**? (Strawberries taste best | Strawberries are fruit)

---

## Kindergarten · Visual Reasoning (`visual_reasoning`)

### Topics
- Symmetry completion
- Rotation (shape same when turned)
- Map of classroom (desk near door)
- Top view vs side view (simple blocks)
- Path finding on grid (3 moves)

### Learning objectives
- Complete line-symmetric pictures.
- Recognize shape after 90° turn (square).
- Read simple classroom map symbols.
- Match block structure to top view diagram.
- Trace shortest path on a small grid.

### Question examples

**Easy**  
1. Fold paper — both sides ___. (match | different)  
2. Turn book — cover shape ___. (same | becomes circle)

**Medium**  
1. On map, restroom by ___. (lunch room | library — labeled map)  
2. Grid: start → two right → one up. Where? (cell B3)

**Hard**  
1. Which top view matches block tower picture?  
2. Symmetry: draw missing half of butterfly

---

# Grade 1

*GradeLevel: `grade_1` · Ages ~6*

---

## Grade 1 · Math (`math`)

### Topics
- Addition/subtraction within 20
- Place value (tens and ones)
- Comparing lengths and clocks (hour)
- Word problems (join/separate)
- 2D/3D shapes (cube, sphere)

### Learning objectives
- Fluently add/subtract within 10; work toward within 20.
- Represent two-digit numbers as tens and ones (to 50).
- Tell time to the hour on analog clocks.
- Solve one-step word problems with drawings.
- Identify faces on simple 3D shapes.

### Question examples

**Easy**  
1. 6 + 4 = ? (10 | 9 | 11)  
2. 10 − 3 = ? (7 | 6 | 8)

**Medium**  
1. 14 = 1 ten and ___ ones (4 | 1 | 14)  
2. Clock shows short hand on 3 — time? (3:00 | 12:00)

**Hard**  
1. Maria has 8 marbles, gets 5 more. Total? (13 | 12 | 14)  
2. Which is a **cube**? (shape image set)

---

## Grade 1 · Science (`science`)

### Topics
- Parts of plants (root, stem, leaf)
- Animal habitats (forest, ocean, desert)
- Materials: wood, metal, plastic
- Light and shadows
- Healthy habits (sleep, food, exercise)

### Learning objectives
- Label basic plant parts and their jobs.
- Match animals to habitats.
- Sort objects by material.
- Explain shadow needs light + object.
- List three healthy daily habits.

### Question examples

**Easy**  
1. Roots help plant ___. (take in water | fly | sing)  
2. Fish live in ___. (water | desert | sky)

**Medium**  
1. Shadow is made when light is ___. (blocked | eaten | painted)  
2. Spoon is often made of ___. (metal | water | air)

**Hard**  
1. Camel best habitat? (desert | ocean | arctic)  
2. Which material is **transparent**? (clear glass | wood block)

---

## Grade 1 · Pattern Recognition (`pattern_recognition`)

### Topics
- Repeating vs growing patterns
- Skip counting by 2s and 5s
- Pattern on hundred chart (color)
- Rule tables (+2)
- Translate pattern across media

### Learning objectives
- Classify patterns as repeating or growing.
- Extend numeric patterns by 2s to 20.
- Describe rule in words and symbols (+, −).
- Find error in multi-step pattern.
- Create pattern given rule “add 2.”

### Question examples

**Easy**  
1. 5,10,15,___ → 20  
2. 🔴🟢🔴🟢___ → 🔴

**Medium**  
1. Rule +2: 3,5,7,___ → 9  
2. Growing tiles: 1,2,3,___ → 4 squares in next figure

**Hard**  
1. Which **does not** fit pattern +5? 5,10,15,18,20 → 18  
2. Copy pattern △△□ with colors red/red/blue — next? blue

---

## Grade 1 · Memory (`memory`)

### Topics
- Memory palace (room locations) — 4 items
- Digit span forward (3–4)
- Story recall (who did what)
- Symbol-code matching (★=cat, ●=dog)
- Delayed pattern recall

### Learning objectives
- Remember four objects with location hints.
- Repeat 3-digit sequence orally (optional audio stem).
- Answer who/what after short story.
- Decode three symbols consistently.
- Reproduce pattern after intervening task.

### Question examples

**Easy**  
1. Remember A-B-A-B — what was first letter?  
2. Match names to faces shown earlier (2 pairs)

**Medium**  
1. Story: Sam fed dog, then walked. What first? (fed dog)  
2. Code: ★=sun, ●=moon. ★ means? (sun)

**Hard**  
1. Remember 3 objects; after counting to 10, recall list  
2. Pattern shown 20 sec ago: □○□○ — third shape? (□)

---

## Grade 1 · Sequencing (`sequencing`)

### Topics
- Recipe steps (4–5)
- Plant life cycle
- Timeline: yesterday/today/tomorrow
- Ordinal to 10th
- Signal words: first, then, finally

### Learning objectives
- Order five images for simple recipe.
- Sequence seed → sprout → plant → flower.
- Place events on past/present/future line.
- Use ordinals through tenth in context.
- Write three-step plan using signal words.

### Question examples

**Easy**  
1. Mix → bake → cool. **First**? (mix)  
2. Tomorrow is after ___. (today | yesterday)

**Medium**  
1. Frog eggs → tadpole → ___ → adult frog (froglet stage image)  
2. **Finally** we wash hands after art. When? (last step)

**Hard**  
1. Put bus ride story in order (4 panels) — which is 3rd?  
2. What step is **between** soil and sprout visible? (water/wait)

---

## Grade 1 · Problem Solving (`problem_solving`)

### Topics
- Draw a picture strategy
- Make a table (two choices)
- Guess and check (two unknowns)
- Open middle (missing addend)
- Physical act it out

### Learning objectives
- Represent problem with bar/tape drawing.
- Organize two-choice data in table.
- Use guess-check for sum to 10.
- Find missing addend in 8 + ? = 11.
- Explain strategy choice in words.

### Question examples

**Easy**  
1. 5 birds on tree, 2 fly away. Left? (3 | 4 | 2)  
2. Red 4, blue 3. Total red and blue? (7)

**Medium**  
1. 9 + ? = 12 → (3 | 2 | 4)  
2. Two shirts, three pants. Outfits? (6 | 5 | 3) — intro combo

**Hard**  
1. Shelf holds 10 books, 4 gone. How many left? (6)  
2. You need 15 stickers, have 9. How many more? (6)

---

## Grade 1 · Critical Thinking (`critical_thinking`)

### Topics
- Why/because (one reason)
- Compare two solutions
- True/false with proof picture
- Category logic (all mammals breathe)
- Ask a better question

### Learning objectives
- Give one relevant reason for claim.
- Pick better plan and say why.
- Verify simple science statements.
- Use “all/some/none” correctly in examples.
- Improve vague question to specific one.

### Question examples

**Easy**  
1. Ice melts in sun **because** ___. (it gets warm | it is square)  
2. All squares have 4 sides — true? (True)

**Medium**  
1. Better plan for heavy bag: (use wagon | drag on hair)  
2. Which question helps more? (How many legs? vs What color is sound?)

**Hard**  
1. Some birds fly, all birds have feathers. Which must be true?  
2. Two ways to fix spilled water — which is **safer**? (towel vs jump in puddle)

---

## Grade 1 · Visual Reasoning (`visual_reasoning`)

### Topics
- Nets of cube (intro)
- Mirror images
- Simple maps (legend)
- Count cubes in stack (≤10)
- Left/right on grid directions

### Learning objectives
- Match cube to its net.
- Identify mirror vs non-mirror letter.
- Use map legend for three symbols.
- Count unit cubes in simple 3D stack.
- Follow N/S/E/W on grid one step.

### Question examples

**Easy**  
1. Mirror of letter b looks like ___. (d | p | q)  
2. Map: 🏠=home, 🏫=school. Symbol for school?

**Medium**  
1. Stack has ___ cubes (picture of L-shape stack)  
2. One step north from start on grid — where?

**Hard**  
1. Which net folds to cube? (four nets shown)  
2. Path: 2 east, 1 south — ending cell?

---

# Grade 2

*GradeLevel: `grade_2` · Ages ~7*

---

## Grade 2 · Math (`math`)

### Topics
- Addition/subtraction within 100
- Even/odd
- Money: coins and values
- Measurement: cm/inches intro
- Arrays intro (rows × columns for multiply preview)

### Learning objectives
- Add/subtract two-digit numbers without regrouping; intro regrouping.
- Determine even/odd from ones digit.
- Count collections of coins ≤ $1.
- Measure length in cm with ruler.
- Describe arrays as equal rows.

### Question examples

**Easy**  
1. 23 + 5 = ? (28 | 27 | 29)  
2. Is 14 even or odd? (even | odd)

**Medium**  
1. 37 + 25 = ? (62 | 52 | 72) — regroup  
2. 3 rows of 4 apples = ___ apples (12 | 7 | 10)

**Hard**  
1. 50 − 18 = ? (32 | 42 | 22)  
2. Coins: 2 quarters, 1 dime = ___ cents (60 | 50 | 70)

---

## Grade 2 · Science (`science`)

### Topics
- States of matter (solid, liquid, gas)
- Food chains (sun → plant → rabbit)
- Earth's landforms (hill, river)
- Magnets attract/repel
- Life cycles (frog, flowering plant)

### Learning objectives
- Sort materials by state with examples.
- Build simple terrestrial food chain.
- Name landforms from photos.
- Predict magnet interaction pairs.
- Order stages in frog/plant cycles.

### Question examples

**Easy**  
1. Ice is a ___. (solid | gas | liquid)  
2. Sun gives energy to ___. (plants | rocks only)

**Medium**  
1. Magnet: north near north will ___. (repel | attract always)  
2. River is landform with flowing ___. (water | sand only)

**Hard**  
1. Food chain: grass → rabbit → ___. (fox | sun)  
2. Water becomes gas when ___. (heated/evaporated | frozen only)

---

## Grade 2 · Pattern Recognition (`pattern_recognition`)

### Topics
- Numeric patterns (+10 on chart)
- Symmetric patterns
- Shape + number combined patterns
- Input-output tables
- Pattern word problems

### Learning objectives
- Extend +10 and −10 patterns on chart.
- Create symmetric dot patterns.
- Describe two-rule patterns (color+shape).
- Use input-output with one operation.
- Solve “what rule?” from examples.

### Question examples

**Easy**  
1. 12,22,32,___ → 42  
2. 🔴🔵🔴🔵 shape+color — next color? 🔴

**Medium**  
1. Rule ×2: 4,8,12,___ → 16  
2. Input 3 → output 7 (+4). Input 5 → ? (9)

**Hard**  
1. Pattern 5,9,13,___ — rule? (+4 | +5)  
2. Broken symmetry — which dot misplaced?

---

## Grade 2 · Memory (`memory`)

### Topics
- Chunking (phone number 3-3-4)
- Story memory (5 events)
- Map memory (where on grid)
- Paired associates (8 pairs study)
- Working memory dual task (count + remember letter)

### Learning objectives
- Group digits into chunks for recall.
- Retell five-event story in order.
- Mark locations recalled on 4×4 grid.
- Learn eight picture-word pairs.
- Hold letter while completing simple count.

### Question examples

**Easy**  
1. Chunk 12-45-67 — first chunk? (12)  
2. Remember 🐱 and 🌳 — pick from six icons

**Medium**  
1. Grid: star was B2 — where? (cell)  
2. Pair: 🍎=A, 🍌=B. 🍌=? (B)

**Hard**  
1. Remember word CAT while adding 3+4 — spell after  
2. Five-step story cards — put in order from memory

---

## Grade 2 · Sequencing (`sequencing`)

### Topics
- Multi-step math word story order
- Historical timeline (school 100 years ago) simple
- Process: investigation (question→test→result)
- Algorithms: add two-digit steps listed
- Time order with a.m./p.m.

### Learning objectives
- Order steps to solve class problem.
- Place school-life events on timeline.
- Sequence science inquiry pictures.
- List addition algorithm steps in order.
- Order daily events with AM/PM labels.

### Question examples

**Easy**  
1. Add ones → add tens → done. **Second**? (add tens)  
2. Breakfast in ___. (a.m. | p.m. — typical)

**Medium**  
1. Experiment: guess → test → ___. (conclude)  
2. Timeline: 2010, 2015, 2020 — earliest? (2010)

**Hard**  
1. Four-step “fair test” — which comes after measure?  
2. Story: plan → draft → edit → publish — third? (edit)

---

## Grade 2 · Problem Solving (`problem_solving`)

### Topics
- Bar model drawings
- Two-step word problems within 100
- Logical elimination (grid riddles)
- Perimeter intro (count units)
- Choose operation (+/−)

### Learning objectives
- Draw part-part-whole for word problems.
- Solve two-step join/separate within 100.
- Use clues to cross out impossible answers.
- Find perimeter by counting unit sides.
- Justify + vs − from story language.

### Question examples

**Easy**  
1. 15 + 27 = ? (42 | 32 | 52)  
2. “How many more” suggests ___ . (+ difference | multiply)

**Medium**  
1. Had 45, spent 18, got 10. End? (37 | 27 | 47)  
2. Rectangle 5 long, 3 wide — perimeter units? (16 | 15 | 8 area trap)

**Hard**  
1. Riddle: A not red, B not blue — logic grid  
2. 62 − 19 = ? (43 | 53 | 41)

---

## Grade 2 · Critical Thinking (`critical_thinking`)

### Topics
- Evidence vs guess
- Compare explanations (pick stronger)
- If-then (conditional) everyday
- Bias intro (small sample)
- Design fair test (one variable)

### Learning objectives
- State what evidence supports claim.
- Choose explanation with matching observation.
- Use if-then for daily rules.
- Recognize “only once” is weak evidence.
- Plan test changing one thing only.

### Question examples

**Easy**  
1. Guess vs measured length — which is more trusted? (measured)  
2. If it rains, ground gets ___. (wet | dry)

**Medium**  
1. Plant A grew more — we gave more water. Evidence strong? (partial — need control)  
2. Fair test changes ___ variable. (one | many)

**Hard**  
1. Two explanations for sinking boat — pick one with weight evidence  
2. If all squares are rectangles, is every rectangle a square? (No)

---

## Grade 2 · Visual Reasoning (`visual_reasoning`)

### Topics
- 3D shapes from multiple views
- Grid coordinates (intro)
- Tangram compose
- Slide/flip/turn vocabulary
- Path planning with obstacles

### Learning objectives
- Match top/side views to block model.
- Plot points on letter-number grid.
- Rearrange tangram pieces to form target.
- Distinguish slide vs flip vs turn.
- Find path avoiding walls on grid.

### Question examples

**Easy**  
1. Slide moves shape without ___. (turning | stretching)  
2. Point at (C,2) on grid — which object?

**Medium**  
1. Which side view matches tower?  
2. Flip letter p looks like ___. (b | d | q)

**Hard**  
1. Shortest path 5 moves east max — count blocks  
2. Tangram: which piece fills gap?

---

# Grade 3

*GradeLevel: `grade_3` · Ages ~8*

---

## Grade 3 · Math (`math`)

### Topics
- Multiplication facts 0–10
- Division as equal groups
- Fractions intro (unit fractions)
- Area as count of units
- Rounding to nearest 10

### Learning objectives
- Recall multiplication facts through 10×10.
- Model division with equal groups and remainders intro.
- Shade unit fractions on same whole.
- Find area by counting unit squares.
- Round two-digit numbers to nearest ten.

### Question examples

**Easy**  
1. 6 × 4 = ? (24 | 20 | 28)  
2. 1/2 of shape shaded — pick correct image

**Medium**  
1. 56 ÷ 7 = ? (8 | 7 | 9)  
2. Rectangle 6×3 area = ___ sq units (18 | 9 | 21)

**Hard**  
1. 47 rounded to nearest ten? (50 | 40 | 45)  
2. 29 ÷ 5 = ? groups and remainder (5 r4 | 4 r5)

---

## Grade 3 · Science (`science`)

### Topics
- Life cycles (complete metamorphosis)
- Weather/climate difference
- Forces: push/pull
- Soils and rocks properties
- Human body systems overview (skeletal, muscular)

### Learning objectives
- Compare incomplete vs complete metamorphosis.
- Distinguish weather (daily) from climate (long).
- Identify forces in playground scenarios.
- Compare sand vs clay water retention.
- Match system to function (bones support).

### Question examples

**Easy**  
1. Butterfly: egg-larva-pupa-adult is ___ metamorphosis. (complete | incomplete)  
2. Push or pull: kicking ball? (push)

**Medium**  
1. Climate is weather over ___. (long time | one hour)  
2. Bones are part of ___ system. (skeletal | digestive)

**Hard**  
1. Which soil holds more water? (clay | sand) — demo context  
2. Muscles work with bones to ___. (move body | digest food)

---

## Grade 3 · Pattern Recognition (`pattern_recognition`)

### Topics
- Multiples patterns
- Geometric growing patterns (staircase squares)
- Function machines
- Doubling/halving patterns
- Pattern generalization (nth term intro words)

### Learning objectives
- List multiples of 3, 4, 6 to 50.
- Build growing square staircase to step 4.
- Use two-operation function machine (+2 then ×2).
- Continue double/halve sequences.
- Predict next term from verbal rule.

### Question examples

**Easy**  
1. 3,6,9,12,___ → 15  
2. 2,4,8,16,___ → 32

**Medium**  
1. Machine: in 5, out 11 (+6). In 8, out? (14)  
2. Staircase 1,3,6,10,___ → 15 (triangular numbers)

**Hard**  
1. Rule: ×3 then −1. Start 4 — third output? (35? trace: 4→11→32) — simplify stem in implementation  
2. Which does not belong in multiples of 4? 8,12,15,16 → 15

---

## Grade 3 · Memory (`memory`)

### Topics
- Mnemonics (ROYGBIV)
- Multiplication fact fluency recall
- Procedural memory (steps of long add)
- Spaced review schedule concept
- Remember diagram labels

### Learning objectives
- Use acronym to recall ordered list.
- Recall facts under timed gentle practice.
- Recite addition algorithm without prompts.
- Explain why review helps memory.
- Label diagram from memory after study.

### Question examples

**Easy**  
1. ROYGBIV helps remember ___. (rainbow colors | planets)  
2. 7×8=? (56 | 54 | 48)

**Medium**  
1. Steps of boiling water safety — order 4 cards  
2. Label plant diagram roots/stem/leaf from memory

**Hard**  
1. Remember 4 science terms; distractor test after mini-game  
2. Recall multiplication family of 6s list three facts

---

## Grade 3 · Sequencing (`sequencing`)

### Topics
- Multi-step math operation order intro
- Water cycle sequence
- Engineering design process (ask-imagine-plan-create-improve)
- Historical event timeline (local community)
- Recipe scaling steps

### Learning objectives
- Order steps in two-step math stories.
- Sequence evaporation-condensation-precipitation.
- Place engineering design cards in order.
- Order three dated community events.
- Sequence safe kitchen steps with adult.

### Question examples

**Easy**  
1. Water cycle: evaporation → condensation → ___. (rain/precipitation)  
2. Ask → imagine → plan → create → ___. (improve)

**Medium**  
1. Buy ingredients before ___ cookies. (bake | eat shells)  
2. Timeline 1900,1950,2000 — order earliest to latest

**Hard**  
1. Two-step: multiply then subtract — which first? (multiply)  
2. Water cycle — what between cloud forms and rain falls? (condensation/cooling context)

---

## Grade 3 · Problem Solving (`problem_solving`)

### Topics
- Draw bar models multiplication/division
- Two-step word problems
- Logical reasoning (ages puzzle simple)
- Area/perimeter distinction
- Estimation then exact

### Learning objectives
- Model equal groups with bars.
- Solve two-step problems (+ then ×).
- Use clues in age riddles (small numbers).
- Choose area vs perimeter formula context.
- Estimate sum then calculate for reasonableness.

### Question examples

**Easy**  
1. 4 bags, 6 apples each — total apples? (24 | 20 | 10)  
2. Perimeter vs area — fence around garden is ___. (perimeter)

**Medium**  
1. 58 + 27 estimate about ___. (90 | 70) then exact (85)  
2. 35 ÷ 5 = ? (7 | 6 | 8)

**Hard**  
1. Books 3 shelves, 12 each, give away 5 — left? (31 | 36 | 41)  
2. Rectangle area 24, width 4 — length? (6 | 8 | 5)

---

## Grade 3 · Critical Thinking (`critical_thinking`)

### Topics
- Claim-evidence-reasoning (CER) intro
- Compare data tables
- Identify assumptions
- Control group concept
- Evaluate internet fact (trusted source intro)

### Learning objectives
- Write one-sentence evidence for claim.
- Compare two bar graphs and conclude.
- Spot hidden assumption in story.
- Explain why control group needed.
- Ask who wrote information source.

### Question examples

**Easy**  
1. Claim: Plants need light. Evidence? (plants in dark wilt)  
2. Graph shows more rain in April — true from data? (read chart)

**Medium**  
1. Assumption: “All dogs like bones” — counterexample? (picky dog story)  
2. Fair test needs group with ___. (no change / control)

**Hard**  
1. Two graphs different scales — which conclusion is **invalid**?  
2. Website with no author — trust level? (low | high)

---

## Grade 3 · Visual Reasoning (`visual_reasoning`)

### Topics
- Orthographic views
- Map scale (1 cm = 1 km intro)
- Symmetry lines count
- Transformations on grid
- 3D volume with unit cubes

### Learning objectives
- Draw/match front/right/top views.
- Use simple scale on map distance.
- Find lines of symmetry in polygons.
- Perform slide and turn on grid.
- Count cubes for rectangular prism.

### Question examples

**Easy**  
1. Square has ___ lines of symmetry. (4 | 2 | 1)  
2. Slide 3 right on grid — new position?

**Medium**  
1. Prism 3×4×2 — unit cubes? (24 | 12 | 9)  
2. Map scale 1 cm = 2 km, 3 cm = ___ km (6 | 5 | 3)

**Hard**  
1. Which net builds prism shown?  
2. Turn 90° clockwise about point — image?

---

# Grade 4

*GradeLevel: `grade_4` · Ages ~9*

---

## Grade 4 · Math (`math`)

### Topics
- Multi-digit multiplication
- Long division one-digit divisor
- Equivalent fractions
- Decimals tenths
- Angles (right, acute, obtuse)

### Learning objectives
- Multiply up to 4-digit by 1-digit.
- Divide up to 4-digit by 1-digit with remainders.
- Generate equivalent fractions.
- Read/write decimals to tenths.
- Classify angles in figures.

### Question examples

**Easy**  
1. 23 × 4 = ? (92 | 84 | 96)  
2. 1/2 = 2/? (4 | 3 | 5)

**Medium**  
1. 84 ÷ 7 = ? (12 | 11 | 13)  
2. 0.4 + 0.3 = ? (0.7 | 0.12 | 1.2)

**Hard**  
1. 456 × 3 = ? (1368 | 1360 | 1388)  
2. Angle 95° is ___. (obtuse | acute | right)

---

## Grade 4 · Science (`science`)

### Topics
- Energy forms (light, heat, motion)
- Electricity circuits (open/closed)
- Rocks and minerals
- Ecosystems (producers/consumers/decomposers)
- Weathering and erosion

### Learning objectives
- Trace energy transfer in simple systems.
- Build concept of open vs closed circuit.
- Classify rocks vs minerals.
- Role-play food web roles.
- Distinguish weathering vs erosion.

### Question examples

**Easy**  
1. Closed circuit needs complete ___. (path | hole)  
2. Plants are ___ in food web. (producers | decomposers)

**Medium**  
1. Breaking rock by ice is ___. (weathering | erosion | melting metal)  
2. Lamp converts electricity to ___. (light/heat | sound only)

**Hard**  
1. Remove decomposers — what happens to dead matter? (builds up / less recycle)  
2. River carries sediment — ___. (erosion | evaporation)

---

## Grade 4 · Pattern Recognition (`pattern_recognition`)

### Topics
- Prime/composite patterns
- Fraction number line patterns
- Visual → numeric rule
- Coordinates patterns (+2 right, −1 up)
- Fibonacci intro (1,1,2,3,5…)

### Learning objectives
- Identify primes to 50.
- Continue fraction sequence on line.
- Derive rule from two examples.
- Predict coordinate after two moves.
- Extend Fibonacci sequence.

### Question examples

**Easy**  
1. 1,1,2,3,5,___ → 8  
2. 1/3,2/3,1,___ → 4/3 or 1 1/3 — age appropriate label

**Medium**  
1. Start (2,3), rule +1 right +1 up — next point? (3,4)  
2. 11,13,17,19,___ → 23 (primes)

**Hard**  
1. Growing L-shapes area 1,3,5,7 — next area? (9)  
2. Rule ×2+1: 3,7,15,___ → 31

---

## Grade 4 · Memory (`memory`)

### Topics
- Remember multi-step procedures
- Vocabulary retention science
- Concept maps from memory
- Formula recall (perimeter formulas)
- Study strategies comparison

### Learning objectives
- Recite steps for long multiplication.
- Define key terms after week review.
- Sketch concept map links from memory.
- Recall perimeter formulas for rect/square.
- Choose effective study strategy for facts.

### Question examples

**Easy**  
1. Perimeter rectangle = 2×(L+W) — recall missing part? (L+W inside)  
2. Terms: producer/consumer — match definitions

**Medium**  
1. List steps long division: divide-multiply-subtract-bring down — order  
2. Concept map: sun → ? → rabbit (plants)

**Hard**  
1. Remember 6 science words after reading new paragraph — test  
2. Explain spaced practice vs cramming — which better long-term?

---

## Grade 4 · Sequencing (`sequencing`)

### Topics
- Multi-step problem planning
- Rock cycle sequence simplified
- Computer algorithm (recipe robot)
- Cause-effect chains (4 steps)
- Research process (question-sources-notes-report)

### Learning objectives
- Write plan before solving 3-step math.
- Order rock cycle stages with labels.
- Sequence robot commands in order.
- Chain causes/effects for erosion story.
- Order research steps ethically (cite sources).

### Question examples

**Easy**  
1. Research: question → find sources → notes → ___. (report)  
2. Robot: turn → forward → forward → ___. (stop)

**Medium**  
1. 3-step math: add tax then tip — order operations context  
2. Rock: magma → igneous → weathering → sediment → ?

**Hard**  
1. Place flood story causes in logical order (4 cards)  
2. Algorithm with loop: repeat step 3 times — flowchart read

---

## Grade 4 · Problem Solving (`problem_solving`)

### Topics
- Strip diagrams multi-step
- Factors/multiples application
- Logic puzzles (grid)
- Measurement conversions (cm/m)
- Error analysis (find mistake)

### Learning objectives
- Represent 3-step problems with diagram.
- Use LCM in scheduling problem.
- Solve logic grid with three categories.
- Convert cm to m in context.
- Identify error in sample solution.

### Question examples

**Easy**  
1. 100 cm = ___ m (1 | 10 | 100)  
2. Factors of 12 include ___. (6 | 5 | 9)

**Medium**  
1. LCM of 4 and 6? (12 | 24 | 8)  
2. Find error: 53×2 computed as 906 instead of 106

**Hard**  
1. Field 24 m × 35 m area? (840 | 820 | 740)  
2. Logic: Tom/Beth grades AB — clue puzzle

---

## Grade 4 · Critical Thinking (`critical_thinking`)

### Topics
- Evaluate arguments (strong/weak)
- Correlation vs causation intro
- Identify bias in chart
- Ethical choice (environment)
- Counterexample in math

### Learning objectives
- Rank arguments by evidence quality.
- Explain ice cream sales and sun not cause-effect alone.
- Spot misleading graph scale.
- Discuss tradeoffs in environmental decision.
- Disprove statement with counterexample.

### Question examples

**Easy**  
1. More ice cream when hot — correlation or proven cause? (correlation)  
2. Counterexample: “All birds fly” — ? (penguin)

**Medium**  
1. Y-axis starts at 90 not 0 — graph is ___. (misleading | perfect)  
2. Strongest claim supported by data table? (pick)

**Hard**  
1. Two plans to reduce waste — evaluate pros/cons choice  
2. If n×5 always ends in 0 or 5 — exception? (0×5=0 ok — find true falsity: n×5 odd? false)

---

## Grade 4 · Visual Reasoning (`visual_reasoning`)

### Topics
- Angle measure with protractor intro
- Map contours intro
- Reflect across line on grid
- Compose/decompose areas
- 3D nets advanced

### Learning objectives
- Measure angles to nearest degree (intro).
- Read simple contour map legend.
- Reflect figures on coordinate grid.
- Split L-shape area into rectangles.
- Match complex net to solid.

### Question examples

**Easy**  
1. Reflect point across vertical line x=3 — image?  
2. L-shape split into two rectangles — strategy?

**Medium**  
1. Net of triangular prism — choose correct  
2. Contour lines close together mean ___. (steep slope | flat)

**Hard**  
1. Area of hexagon on grid by compose  
2. Rotate 180° about origin — coordinates change?

---

# Grade 5

*GradeLevel: `grade_5` · Ages ~10*

---

## Grade 5 · Math (`math`)

### Topics
- Fraction operations (like denominators, unlike intro)
- Decimal operations tenths/hundredths
- Volume (unit cubes)
- Coordinate plane (Q1)
- Order of operations intro

### Learning objectives
- Add/subtract fractions with unlike denominators (LCD).
- Multiply decimal by whole number.
- Calculate volume of rectangular prism.
- Plot and read points in first quadrant.
- Evaluate expressions with ×, ÷, +, − and parentheses.

### Question examples

**Easy**  
1. 1/4 + 1/4 = ? (1/2 | 2/4 | 1/8)  
2. 0.5 × 6 = ? (3.0 | 30 | 0.56)

**Medium**  
1. 1/3 + 1/6 = ? (1/2 | 2/9 | 1/4)  
2. Prism 4×5×2 volume = ? (40 | 20 | 11)

**Hard**  
1. 2 + 3 × 4 = ? (14 | 20 | 24)  
2. Point (3,5) moved left 2 — new point? (1,5)

---

## Grade 5 · Science (`science`)

### Topics
- Matter conservation
- Mixtures vs solutions
- Photosynthesis equation (words level)
- Solar system motions (revolution/rotation)
- Human body systems interactions

### Learning objectives
- Explain mass conserved in closed system.
- Separate mixture with screen/filter demo.
- Describe inputs/outputs of photosynthesis.
- Distinguish Earth revolution vs rotation.
- Explain digestive + circulatory cooperation.

### Question examples

**Easy**  
1. Dissolving salt in water makes a ___. (solution | compound gas)  
2. Earth revolves around ___. (Sun | Moon)

**Medium**  
1. Photosynthesis needs CO₂, water, ___. (light | darkness only)  
2. Filter separates ___ mixture. (heterogeneous | element)

**Hard**  
1. Closed flask mass before/after ice melt — mass? (same | lost)  
2. Blood carries oxygen from ___ to cells. (lungs/heart | skin only)

---

## Grade 5 · Pattern Recognition (`pattern_recognition`)

### Topics
- Ratio tables
- Linear patterns (rule y=mx+b words)
- Visual fractals intro (Sierpinski)
- Powers of 10 patterns
- Symbolic patterns (△=2n)

### Learning objectives
- Complete ratio table consistently.
- Describe linear growth in words.
- Recognize self-similar pattern steps.
- Multiply/divide by powers of 10 mentally.
- Translate symbol rule to numbers.

### Question examples

**Easy**  
1. 2,6,10,14,___ → 18 (+4)  
2. ×10 pattern: 3,30,300,___ → 3000

**Medium**  
1. Ratio 2:3, count 8 → other? (12 | 10 | 6)  
2. Rule “double then add 1”: 2→5→11→___ → 23

**Hard**  
1. y increases 3 each step, start 4 — 5th value? (16)  
2. Which fits y=2n: n=4→? (8 | 6 | 10)

---

## Grade 5 · Memory (`memory`)

### Topics
- Long-term review plans
- Remembering formulas under stress
- Interleaving practice benefits
- Narrative mnemonic stories
- Recall lab safety rules order

### Learning objectives
- Design weekly review calendar.
- Retrieve formula with cue words.
- Explain interleaving vs blocked practice.
- Create story mnemonic for planets order.
- List lab safety steps from memory.

### Question examples

**Easy**  
1. Volume formula V=___×w×h (l | L | length)  
2. Safety: goggles → ___ → dispose chemicals (procedure)

**Medium**  
1. Interleaving means mixing ___ types of problems. (different | identical only)  
2. My Very Educated Mother… helps remember ___. (planet order)

**Hard**  
1. Recall 8 formulas after mixed practice week — quiz design note  
2. Order 6 lab safety rules after one demo

---

## Grade 5 · Sequencing (`sequencing`)

### Topics
- Order of operations in context
- Scientific method full cycle
- Engineering iterative design loops
- Historical cause timelines (wars/inventions) age-appropriate
- Project management (milestones)

### Learning objectives
- Apply PEMDAS in word context carefully.
- Sequence hypothesis→experiment→analyze→conclusion.
- Document design loop iterations in order.
- Place invention milestones on timeline.
- Order project tasks with dependencies.

### Question examples

**Easy**  
1. PEMDAS: parentheses first — true? (True)  
2. Hypothesis before ___. (experiment | conclusion)

**Medium**  
1. Design: prototype → test → analyze → ___. (redesign/improve)  
2. Task B needs A done first — dependency reasoning

**Hard**  
1. Multi-step science fair project order (5 steps)  
2. Timeline: invention of telephone before internet — true?

---

## Grade 5 · Problem Solving (`problem_solving`)

### Topics
- Complex word problems (fractions)
- Ratio reasoning
- Optimization (max area fixed perimeter intro)
- Data-driven decisions (mean/median)
- Work backwards strategy

### Learning objectives
- Solve fraction problems in context.
- Use ratio tables for scaling recipes.
- Compare rectangles same perimeter different area.
- Choose mean vs median for question.
- Work backwards from end condition.

### Question examples

**Easy**  
1. Recipe scale 2:3 flour to sugar, 4 cups flour → sugar? (6 | 5 | 8)  
2. Mean of 2,4,10? (5 | 4 | 6)

**Medium**  
1. Perimeter 40, which rectangle has larger area? (10×10 vs 15×5)  
2. Work back: age after +3 twice is 15 — start? (9 | 12 | 6)

**Hard**  
1. 2/3 of 27? (18 | 9 | 12)  
2. Median better than mean when ___ outliers (outliers present)

---

## Grade 5 · Critical Thinking (`critical_thinking`)

### Topics
- Evaluate models (limitations)
- Variable control in experiments
- Media literacy (charts)
- Ethical dilemmas (science)
- Mathematical proof intro (odd+odd=even)

### Learning objectives
- State limitation of classroom model.
- Identify independent/dependent variables.
- Detect cherry-picked data range.
- Discuss ethical tradeoff in experiment on animals (awareness).
- Explain simple proof with algebra tiles words.

### Question examples

**Easy**  
1. Model Sun-Earth distance not to scale — limitation? (size distance)  
2. Independent variable is what we ___. (change on purpose)

**Medium**  
1. Chart shows only weekend data — bias? (yes | no)  
2. Odd+odd even — always? (yes | sometimes)

**Hard**  
1. Two studies conflict — how decide? (methods/sample)  
2. Proof: if a even, a=2k — explain in words choice

---

## Grade 5 · Visual Reasoning (`visual_reasoning`)

### Topics
- Coordinate transformations
- Scale drawings
- 3D slicing cross-sections
- Network shortest path
- Isometric drawing intro

### Learning objectives
- Translate/reflect on coordinate plane.
- Use scale factor on simple floor plan.
- Predict cross-section of prism slice.
- Find shorter path on weighted grid.
- Sketch isometric cube stack.

### Question examples

**Easy**  
1. Scale 1:2 means drawing ___ real. (half | double)  
2. Slice parallel to base of cylinder — shape? (circle)

**Medium**  
1. Point (4,2) reflected over x-axis → (4,-2)  
2. Scale 1 cm:5 m, draw 3 cm → ___ m (15 | 8 | 5)

**Hard**  
1. Cross-section of sphere by plane — circle always? (yes)  
2. Grid path with weights — pick least cost path

---

# Grade 6

*GradeLevel: `grade_6` · Ages ~11–12*

---

## Grade 6 · Math (`math`)

### Topics
- Ratios and unit rates
- Dividing fractions
- Integers intro (number line)
- Expressions and equations (one variable)
- Statistical displays (histogram)

### Learning objectives
- Solve ratio and rate problems.
- Divide fractions with models and algorithm.
- Order and operate on integers intro.
- Solve one-step equations.
- Interpret histograms.

### Question examples

**Easy**  
1. Ratio 3:2, total 10 parts — value of 3 parts if total 20? (12 | 10 | 8)  
2. −3 + 5 = ? (2 | −2 | 8)

**Medium**  
1. 2/3 ÷ 1/4 = ? (8/3 or 2 2/3 | 2/12)  
2. Solve x + 7 = 15 (x=8 | 7 | 9)

**Hard**  
1. Unit rate: 240 miles in 4 hours → mph (60 | 80 | 40)  
2. Histogram shows which range most frequent? (read chart)

---

## Grade 6 · Science (`science`)

### Topics
- Cells (plant vs animal)
- Energy transfer in ecosystems (% energy loss)
- Weather vs climate models
- Atomic/molecular intro (particles)
- Experimental design (replication)

### Learning objectives
- Compare cell organelles functions.
- Explain 10% rule energy transfer.
- Interpret simple climate model graph.
- Describe particle model of states.
- Design replicated trials.

### Question examples

**Easy**  
1. Plant cells have ___ for photosynthesis. (chloroplasts | bones)  
2. Energy pyramid loses energy at each ___. (trophic level/step)

**Medium**  
1. Independent variable in plant light experiment? (light amount | plant height measure)  
2. Molecules in gas are ___ apart than liquid. (farther | closer)

**Hard**  
1. Why only ~10% energy to next level? (lost as heat)  
2. Replication means repeat trial to check ___. (reliability | color)

---

## Grade 6 · Pattern Recognition (`pattern_recognition`)

### Topics
- Proportional relationships
- Linear vs nonlinear graphs
- Quadratic intro patterns (n²)
- Exponential intro (doubling bacteria)
- Generalizing with variables

### Learning objectives
- Identify proportional from table (y/x constant).
- Distinguish linear vs nonlinear scatter.
- Continue square numbers 1,4,9,16…
- Describe exponential growth in words.
- Write rule with variable n.

### Question examples

**Easy**  
1. 1,4,9,16,___ → 25  
2. 3,6,12,24,___ → 48 (×2)

**Medium**  
1. Table x:1,2,3 y:2,4,6 — proportional? (yes | no)  
2. Rule 3n+1: n=4 → ? (13 | 12 | 10)

**Hard**  
1. Nonlinear: y=x² vs y=3x — which grows faster for x>3? (x²)  
2. Bacteria double hourly — after 3 hours from 1? (8 | 6 | 4)

---

## Grade 6 · Memory (`memory`)

### Topics
- Study systems for exams
- Retrieving procedures under time pressure
- Memory and metacognition
- Remembering lab variables
- Spaced retrieval practice design

### Learning objectives
- Plan spaced retrieval for unit test.
- Recall steps dividing fractions cold.
- Reflect on what you don’t know (metacognition).
- List variables from memory after lab sheet removed.
- Teach peer mnemonic responsibly.

### Question examples

**Easy**  
1. Spaced practice spreads study over ___. (days | one minute)  
2. Metacognition is thinking about ___. (your thinking | lunch)

**Medium**  
1. Without notes, list cell organelles functions (selected set)  
2. After learning ratio, recall definition in own words

**Hard**  
1. Design 5-day review plan for integer unit — outline bullets  
2. Recall experimental variables after 24h delay test

---

## Grade 6 · Sequencing (`sequencing`)

### Topics
- Multi-step equation modeling order
- Scientific method with statistics
- Systems thinking (feedback loops) intro
- Technology design sprint phases
- Historical argument timelines (claim-evidence-order)

### Learning objectives
- Order algebraic solution steps legally.
- Integrate data analysis after experiment.
- Describe feedback loop in predator-prey simple model.
- Sequence design sprint: empathize→define→ideate→prototype→test.
- Order historical claims by supporting evidence chronology.

### Question examples

**Easy**  
1. Solve 2x+3=11: subtract 3 then ___ . (divide by 2)  
2. Collect data after ___. (experiment | hypothesis)

**Medium**  
1. Predator increase → prey decrease → predator decrease — loop order  
2. Design sprint: prototype before ___. (user test)

**Hard**  
1. Argue climate trend using ordered evidence cards  
2. Multi-step inequality word problem — plan steps first

---

## Grade 6 · Problem Solving (`problem_solving`)

### Topics
- Ratio/percent problems
- Integer contexts (debt/temp)
- Systems of simple constraints
- Probability intro (theoretical)
- Generalize pattern to equation

### Learning objectives
- Solve percent increase/decrease.
- Model elevation/debt with integers.
- Satisfy two constraints (menu budget).
- Compute simple theoretical probability.
- Turn pattern rule into equation.

### Question examples

**Easy**  
1. 20% of 50? (10 | 15 | 5)  
2. P(blue) bag 3 blue 7 red? (3/10 | 7/10)

**Medium**  
1. Price $40, 25% off → pay? ($30 | $35 | $25)  
2. Rule adds 5: nth term 5n+2 — 10th term? (52 | 50 | 57)

**Hard**  
1. Budget $50, buy 3 books $12 each tax 10% — enough? (solve)  
2. Integer: −5° + drop 8° → ? (−13 | −3 | 13)

---

## Grade 6 · Critical Thinking (`critical_thinking`)

### Topics
- Evaluate scientific claims (peer review intro)
- Causal models vs data
- Logical fallacies (small sample, appeal)
- Math counterexamples/proofs
- Ethical STEM decisions

### Learning objectives
- Explain peer review purpose.
- Distinguish model prediction from proof.
- Name fallacy in short article.
- Construct counterexample for false conjecture.
- Debate STEM issue with evidence both sides.

### Question examples

**Easy**  
1. Peer review helps catch ___. (errors/bias | colors)  
2. Fallacy: “everyone says so” is appeal to ___. (popularity | data)

**Medium**  
1. Model predicts; experiment ___. (tests | replaces)  
2. Conjecture “n²+n+41 always prime” — small n true, counterexample search concept

**Hard**  
1. Two news sources conflict — evaluate methods  
2. Decide if correlation enough to recommend policy — justify

---

## Grade 6 · Visual Reasoning (`visual_reasoning`)

### Topics
- Coordinate geometry (distance on grid)
- 3D projections
- Transformations composition
- Graph interpretation (rate from graph)
- Vector intro (arrow direction/magnitude)

### Learning objectives
- Find distance on horizontal/vertical grid.
- Match 3D object to 2D projection set.
- Compose two transformations predict result.
- Determine speed from distance-time graph slope.
- Add vectors graphically intro.

### Question examples

**Easy**  
1. Distance from (1,2) to (1,5)? (3 | 4 | 5)  
2. Translation then translation — same as one slide? (maybe | never)

**Medium**  
1. Rotate 90° then reflect — equivalent to? (discuss options)  
2. Steeper distance-time graph means ___. (faster speed | slower)

**Hard**  
1. Vector 3 east + 4 north — length? (5 | 7 | 1)  
2. Identify 3D figure from three orthographic views given

---

# Catalog population checklist

When implementing seeds/import from this blueprint:

- [ ] **64 grade×category** sections reviewed for age appropriateness  
- [ ] Each quiz row: `slug`, `gradeLevel`, `category`, `difficultyLevel`  
- [ ] Each question: `topic` from Topics list; `difficultyLevel` only when override needed  
- [ ] **Logic Lab** and all logic content → `critical_thinking` only  
- [ ] Minimum **3 quizzes per grade×category** (Easy, Medium, Hard) recommended for MVP catalog breadth  
- [ ] Minimum **5–8 questions** per quiz for player value (current MVP uses 2–3 — increase in content phase)  
- [ ] Align demo child `grade_2` with Grade 2 Math/Pattern quizzes for QA  
- [ ] No `subject` string in new content (deprecated field)  
- [ ] Peer review by educator for stem reading level per grade band  

### Suggested slug convention

```text
{gradeLevel}-{category}-{topic-slug}-{difficulty}
e.g. grade_2-pattern_recognition-repeating-colors-easy
```

### Recommended catalog size (future)

| Scope | Suggested minimum |
|-------|-------------------|
| Per grade×category | 3 quizzes (E/M/H) × 1 primary topic each = start |
| Full blueprint depth | 8 topics × 3 difficulties ≈ 24 quizzes per grade×category (long-term) |
| Questions per quiz | 5–10 for production; 3 for pilot |

**Pilot recommendation:** Implement **one topic per category per grade** at Easy/Medium/Hard first (24 quizzes × 8 grades = 192 quizzes long-term; pilot with 3 grades).

---

**Document end.** For schema and migration, see [07-adaptive-content-foundation.md](../specs/07-adaptive-content-foundation.md).
