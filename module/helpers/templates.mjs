/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    'systems/axismundirpg/templates/actor/parts/actor-combat.html',
    'systems/axismundirpg/templates/actor/parts/actor-description.html',
    'systems/axismundirpg/templates/actor/parts/actor-items.html',
    'systems/axismundirpg/templates/actor/parts/actor-spells.html',
    'systems/axismundirpg/templates/actor/parts/actor-pericias.html',
    'systems/axismundirpg/templates/actor/parts/actor-features.html',
    'systems/axismundirpg/templates/actor/parts/monster-skills.html'
  ]);
};
