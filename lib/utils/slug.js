import slugify from "slugify";

const slugOpts = { lower: true, strict: true, trim: true };

/**
 * Generates a unique slug for `model` by appending -2, -3, ... (or a custom
 * suffix hint) until no document has it. Used for vendor business slugs
 * (which double as the subdomain), product slugs, category slugs, etc.
 */
export async function generateUniqueSlug(Model, text, { field = "slug", suffixHint } = {}) {
  const base = slugify(text, slugOpts) || "item";
  let candidate = base;
  let attempt = 1;

  while (await Model.exists({ [field]: candidate })) {
    attempt += 1;
    candidate = suffixHint && attempt === 2 ? `${base}-${slugify(suffixHint, slugOpts)}` : `${base}-${attempt}`;
  }

  return candidate;
}

export function slugifyText(text) {
  return slugify(text, slugOpts);
}
