# Painted illustration prompts

The hero now uses your painted image (`assets/illustrations/hero.jpg`). The prompts below create the rest of the site's images in the **same painted style**. Use them in any image generator that accepts a reference image, such as ChatGPT (image generation), Google Gemini, or Midjourney with `--cref`/`--sref`.

## How to keep Vijay & Rashima looking the same in every image

1. **Upload `assets/illustrations/hero.jpg` as the reference image** with every prompt. Say "same couple, same faces and art style as the reference".
2. Paste the **style block** at the start of each prompt, word for word.
3. Generate a few options and pick the ones where the faces match best.

**Style block (paste first, every time):**
> Elegant hand-painted Indian wedding illustration, soft watercolour and gouache with fine ink outlines and delicate gold detailing, warm ivory background, romantic and graceful, semi-realistic proportions, the same groom (trimmed beard, warm smile) and bride (long dark hair, bindi, kind eyes) as the reference image, scattered rose petals, no text, no watermark, no border.

## Sizes and where to save

| Image | Save as | Shape |
|---|---|---|
| Function cards | `assets/illustrations/haldi.jpg`, `mehendi.jpg`, `sangeet.jpg`, `wedding.jpg`, `reception.jpg` | **Portrait 3:4** (e.g. 1200×1600) |
| Love story | `assets/illustrations/story1.jpg` … `story6.jpg` | **Portrait 4:5** (e.g. 1200×1500) |
| RSVP thank-you | `assets/illustrations/thankyou.jpg` | Portrait 3:4 |
| Hero (sharper version) | `assets/illustrations/hero.jpg` | Portrait ~7:8, at least 1200px wide |

On the cards, the painting fills the top of the card and fades into the card colour at the bottom. Keep the couple in the **upper two-thirds** of the frame.

Before uploading, compress each image to roughly **150–300 KB** (for example with squoosh.app, as WebP or JPG), so the site loads fast over WhatsApp.

**No code changes are needed.** Save each image as a `.jpg` with exactly the file name in the table above, inside `assets/illustrations/`. The site uses it automatically in place of the cartoon. Any image you haven't made yet keeps showing the cartoon version. (To use `.png` or `.webp` instead, change the extension for that image in `config.js`.)

---

## Function cards (3:4 portrait)

**Haldi:**
> [style block] The couple at their Haldi ceremony, playful and laughing. Groom in a bright yellow kurta-pyjama with a marigold garland. Bride in a yellow-and-orange lehenga with fresh-flower jewellery (floral maang tikka, earrings and bangles of white jasmine and marigold). Small turmeric smudges on their cheeks. A brass haldi bowl, marigold flowers and soft yellow splashes around them. Background is a sunny courtyard with marigold strings, in sunshine yellow and marigold orange tones.

**Mehendi:**
> [style block] The couple at their Mehendi. Groom in a sage-green kurta with a deep emerald Nehru jacket. Bride in a green-and-pink lehenga, proudly raising both hands to show intricate bridal mehendi on her palms. Mehendi cones, paisley leaf motifs and little hearts around them. Background is a garden with hanging pink and green drapes and fairy lights, in green and blush pink tones.

**Sangeet:**
> [style block] The couple dancing joyfully at their Sangeet. Groom in a royal-blue velvet bandhgala with gold buttons. Bride in a shimmering purple sequinned lehenga, twirling mid-dance, with their hands joined. Music notes, a dhol and a sparkling disco ball nearby. Background is an evening stage with warm spotlights and sparkles, in royal blue, purple and gold tones.

**Wedding / Pheras:**
> [style block] The couple during the wedding ceremony under a floral mandap. Groom in an ivory-and-gold sherwani with a red safa and a pearl-and-flower sehra. Bride in a red bridal lehenga with a red dupatta over her head and full bridal jewellery (maang tikka, nath, choker). The bride is holding a red-and-marigold varmala. A sacred fire (havan kund), a copper kalash with mango leaves, and gold rings nearby. Deep red, maroon and gold tones.

**Reception:**
> [style block] The couple at their evening Reception, raising champagne flutes in a toast. Groom in a sharp black tuxedo with a bow tie. Bride in an elegant champagne-gold sequinned gown (or a designer saree). A tiered wedding cake and warm fairy lights behind them. Elegant black, champagne and gold tones with soft bokeh.

## RSVP thank-you (3:4 portrait)

> [style block] The couple smiling and waving warmly at the viewer, standing close together and holding hands, in festive Indian outfits (groom in an ivory sherwani, bride in a pink lehenga). Floating hearts and rose petals. Soft blush-pink background. A cheerful "thank you" mood.

## Love story (4:5 portrait)

1. **How we met:**
   > [style block] The couple's first meeting in a cosy café, in casual modern clothes (he in a light blue shirt, she in a pink dress). Both are holding coffee cups and smiling shyly at each other, with a window and plants behind them.
2. **First date:**
   > [style block] The couple on their first date at night under strings of fairy lights and stars, holding hands, in casual outfits.
3. **Adventures together:**
   > [style block] The couple travelling in the mountains, waving happily, in casual travel clothes, with snowy peaks and pine trees behind them.
4. **The proposal:**
   > [style block] The groom on one knee holding an open ring box at a sunset beach, while the bride covers her mouth in joyful surprise. Hearts float in a pink and orange sky.
5. **Families meet:**
   > [style block] The couple doing namaste in traditional pastel kurta and lehenga at a family home, with a marigold toran, a rangoli and lit diyas.
6. **Forever begins:**
   > [style block] The couple in full wedding attire taking pheras around the sacred fire under a flower mandap, joined by the bride's dupatta tied to the groom's stole.
