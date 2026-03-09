export const COLORLAB_SECTION_TO_SLUG = {
    creative: 'creative-looks',
    profile: 'picture-profiles',
    lut: 'lut',
};

export const COLORLAB_SECTION_BY_SLUG = Object.fromEntries(
    Object.entries(COLORLAB_SECTION_TO_SLUG).map(([section, slug]) => [slug, section])
);
