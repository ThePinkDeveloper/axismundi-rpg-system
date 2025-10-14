import {successChatMessage} from '../helpers/chat.mjs';
import {onManageActiveEffect, prepareActiveEffectCategories} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class AxisMundiRPGActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['axismundirpg', 'sheet', 'actor'],
      template: 'systems/axismundirpg/templates/actor/actor-sheet.html',
      width: 720,
      height: 720,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'combat' }]
    });
  }

  /** @override */
  get template() {
    return `systems/axismundirpg/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();


    //enrichedBiography -- enriches system.biography for editor
    context.enrichedBiography = await TextEditor.enrichHTML(this.object.system.biography, {async: true});

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type === 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
      this._prepareActorData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type === 'monster') {

      this._prepareItems(context);
      this._prepareActorData(context);
    }

    // Prepare Stronghold data and items
    if (actorData.type === 'stronghold') {
      this._prepareItems(context);
    }

    // Prepare Vehicle data and items
    if (actorData.type === 'vehicle') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareActorData(context) {
    // Handle saves.
    for (let [k, v] of Object.entries(context.data.saves)) {
      v.label = game.i18n.localize(CONFIG.AXISMUNDIRPG.saves[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.data.abilities)) {
      v.label = game.i18n.localize(CONFIG.AXISMUNDIRPG.abilities[k]) ?? k;
    }
    // Handle money.
    for (let [k, v] of Object.entries(context.data.money)) {
      v.label = game.i18n.localize(CONFIG.AXISMUNDIRPG.money[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const weapons = [];
    const armors = [];
    const spells = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: []
    };
    const periciasBasicas = [];
    const periciasAvanzadas = [];
    const features = [];
    const monsterSkills = []

    // Define an object to store carried weight.
    let preparedWeight = {
      'value': 0,
      _addWeight (moreWeight, quantity) {
        if (!quantity || quantity === '' || Number.isNaN(quantity) || quantity < 0) {
          return; // check we have a valid quantity, and do nothing if we do not
        }
        let q = Math.floor(quantity / 20);
        if (!Number.isNaN(parseFloat(moreWeight))) {
          this.value += parseFloat(moreWeight) * quantity;
        } else if (moreWeight === '*' && q > 0) { // '*' is gold pieces
          this.value += q;
        }
      }
    };

    let carriedWeight = {
      'value': 0,
      _addWeight (moreWeight, quantity) {
        if (!quantity || quantity === '' || Number.isNaN(quantity) || quantity < 0) {
          return; // check we have a valid quantity, and do nothing if we do not
        }
        let q = Math.floor(quantity / 100);
        if (!Number.isNaN(parseFloat(moreWeight))) {
          this.value += parseFloat(moreWeight) * quantity;
        } else if (moreWeight === '*' && q > 0) { // '*' is gold pieces
          this.value += q;
        }
      }
    };

    let maxCarriedWeight = {
      'value': 0,
      _calculateMaxCarriedWeight(item) {
        this.value += Number(item.system.capacity.value);
      }
    }

    let weightLevel = {
      'value': 0,
      _calculateWeightLevel(carriedWeightValue, strValue) {
        if (carriedWeightValue == 0) {
          this.value = 0;
        } else if (carriedWeightValue < strValue) {
          this.value = 1;
        } else if (carriedWeightValue < strValue * 4) {
          this.value = 2;
        } else if (carriedWeightValue < strValue * 5) {
          this.value = 3;
        }
      }
    };

    if (context.items.filter(item => item.type === 'pericia').length === 0) {
      const alertaPericiaData = {
        name: 'Alerta',
        type: 'pericia'
      }
      const arquitecturaPericiaData = {
        name: 'Arquitectura',
        type: 'pericia'
      }
      const escalaPericiaData = {
        name: 'Escalada',
        type: 'pericia'
      }
      const detectarPericiaData = {
        name: 'Detectar',
        type: 'pericia'
      }
      const forzarPuertasPericiaData = {
        name: 'Forzar Puertas',
        type: 'pericia'
      }
      const idiomasPericiaData = {
        name: 'Idiomas',
        type: 'pericia'
      }
      const sigiloPericiaData = {
        name: 'Sigilo',
        type: 'pericia'
      }

      Item.create(alertaPericiaData, {parent: this.actor}).then(res => {
        res.update({'system.advanced.value': false});
        res.update({'system.valorBase.value': 2});
        res.update({'system.caracteristica.value': 'wis'});
        res.update({'system.description': 'Permite detectar emboscadas y ataques por sorpresa antes de que sea demasiado tarde.'});
        periciasBasicas.push(res);
      });
      Item.create(arquitecturaPericiaData, {parent: this.actor}).then(res => {
        res.update({'system.advanced.value': false});
        res.update({'system.valorBase.value': 1});
        res.update({'system.description': 'Permite recibir datos sobre construcciones, detectar bajadas imperceptibles, muros de material distinto, etc.'});
        periciasBasicas.push(res);
      });
      Item.create(escalaPericiaData, {parent: this.actor}).then(res => {
        res.update({'system.advanced.value': false});
        res.update({'system.valorBase.value': 1});
        res.update({'system.caracteristica.value': 'con'});
        res.update({'system.description': 'Permite trepar por superficies difíciles o mantenerse agarrado en momentos complicados.'});
        periciasBasicas.push(res);
      });
      Item.create(detectarPericiaData, {parent: this.actor}).then(res => {
        res.update({'system.advanced.value': false});
        res.update({'system.valorBase.value': 1});
        res.update({'system.description': 'Permite encontrar elementos relevantes que pueden haberse pasado por alto.'});
        periciasBasicas.push(res);
      });
      Item.create(forzarPuertasPericiaData, {parent: this.actor}).then(res => {
        res.update({'system.advanced.value': false});
        res.update({'system.valorBase.value': 1});
        res.update({'system.caracteristica.value': 'str'});
        res.update({'system.description': 'Permite desatascar puertas o incluso echarlas abajo.'});
        periciasBasicas.push(res);
      });
      Item.create(idiomasPericiaData, {parent: this.actor}).then(res => {
        res.update({'system.advanced.value': false});
        res.update({'system.valorBase.value': 0});
        res.update({'system.caracteristica.value': 'int'});
        res.update({'system.description': 'Indica la capacidad del personaje para comprender idiomas relacionados con el suyo y aprenderlos en general. Un especialista puede leer y comprender cualquier texto escrito con una tirada con éxito de esta pericia, a partir del nivel 4.'});
        periciasBasicas.push(res);
      });
      Item.create(sigiloPericiaData, {parent: this.actor}).then(res => {
        res.update({'system.advanced.value': false});
        res.update({'system.valorBase.value': 2});
        res.update({'system.caracteristica.value': 'dex'});
        res.update({'system.description': 'Permite pillar a enemigos por sorpresa, esconderse, pasar frente a un monstruo dormido y, en general, mantener tu presencia oculta a los demás.'});
        periciasBasicas.push(res);
      });
    }

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item' || i.type === 'container') {
        gear.push(i);
        if (i.system.prepared.value) {
          preparedWeight._addWeight((i.system.weight.value > 0) ? i.system.weight.value : 1, i.system.quantity.value);
        } else {
          carriedWeight._addWeight(i.system.weight.value, i.system.quantity.value);
        }
        if (i.type === 'container' && i.system.prepared.value) {
          maxCarriedWeight._calculateMaxCarriedWeight(i);
          
        }
      } else if (i.type === 'weapon') { // Append to weapons.
        weapons.push(i);
        if (i.system.prepared.value) {
          preparedWeight._addWeight((i.system.weight.value > 0) ? i.system.weight.value : 1, 1); // Weapons are always quantity 1
        } else {
          carriedWeight._addWeight(i.system.weight.value, 1); // Weapons are always quantity 1
        } // Weapons are always quantity 1
      } else if (i.type === 'armor') { // Append to armors.
        armors.push(i);
        carriedWeight._addWeight(i.system.weight.value, 1); // Armor is always carried and quantity 1
      } else if (i.type === 'spell') { // Append to spells.
        if (i.system.spellLevel.value !== undefined) {
          spells[i.system.spellLevel.value].push(i);
        }
      } else if (i.type === 'pericia') { // Append to pericias.
        if (i.system.advanced.value === true) {
          periciasAvanzadas.push(i);
        } else {
          periciasBasicas.push(i);
        }      
      } else if (i.type === 'feature') { // Append to features.
        features.push(i);
      } else if (i.type === 'monsterSkill') { // Append to monsterSkills.
        monsterSkills.push(i);
      }
    }

    // Iterate through money, add to carried weight
    if (context.data.money) {
      let gp = Number(context.data.money.gp.value);
      gp += context.data.money.pp.value;
      gp += context.data.money.ep.value;
      gp += context.data.money.sp.value;
      gp += context.data.money.cp.value;
      carriedWeight._addWeight('*', gp);  // '*' will calculate GP weight
    }

    // Assign and return
    context.gear = gear;
    context.weapons = weapons;
    context.armors = armors;
    context.spells = spells;
    context.features = features.sort( (a, b) => a.system.sfLevel.value - b.system.sfLevel.value );
    context.preparedWeight = preparedWeight; 
    context.carriedWeight = carriedWeight;
    context.preparedWeightValue = Math.ceil(preparedWeight.value); // we discard fractions of weight when we update the sheet
    context.carriedWeightValue = Math.ceil(carriedWeight.value); // we discard fractions of weight when we update the sheet
    context.maxCarriedWeightValue = maxCarriedWeight.value;
    context.weightLevel = weightLevel;
    context.monterSkills = monsterSkills;

    if (context.actor.type === 'character') {
      context.periciasBasicas = periciasBasicas;
      context.periciasAvanzadas = periciasAvanzadas;

      weightLevel._calculateWeightLevel(carriedWeight.value, this.actor.system.abilities.str.value);

      const weight = {}
      weight.light = context.actor.system.abilities.str.value - 1;   
      weight.medium = context.actor.system.abilities.str.value * 4 - 1;
      weight.heavy = context.actor.system.abilities.str.value * 5 - 1;
      context.weight = weight;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Check Item Prepared
    html.find('.item-prepared').click(this._onItemPrepared.bind(this));
    
    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Prepare Spells
    html.find('.spell-prepare').click(ev => {
      const change = ev.currentTarget.dataset.change;
      if (parseInt(change)) {
        const li = $(ev.currentTarget).parents('.item');
        const item = this.actor.items.get(li.data('itemId'));
        let newValue = item.system.prepared.value + parseInt(change);
        item.update({'system.prepared.value': newValue});
      }
    });

    // Quantity
    html.find('.quantity').click(ev => {
      const change = ev.currentTarget.dataset.change;
      if (parseInt(change)) {
        const li = $(ev.currentTarget).parents('.item');
        const item = this.actor.items.get(li.data('itemId'));
        let newValue = item.system.quantity.value + parseInt(change);
        item.update({'system.quantity.value': newValue});
      }
    });

    // Active Effect management
    html.find('.effect-control').click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Siege Engine range bonuses
    if (this.actor.type === 'siegeEngine') {
      html.find('input[name="rangeBonus"]').click(ev => this.actor.update({'system.rangeBonus.value': Number(ev.currentTarget.value)}));
    }

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      const parser = new DOMParser();
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
        if (li.classList.contains('advanced-pericia')) {
          const item = this.actor.items.get(li.getAttribute('data-item-id'));
          if (item.system.periciaCalculada.value === true) return;
          const base = item.system.valorBase.value;
          let mod = 0
          if (item.system.caracteristica.value !== '') {
            mod = this.actor['system']['abilities'][item.system.caracteristica.value]['bonus'];
          }
          item.update({'system.cantidad.value': (base + mod) < 0 ? 0 : base + mod});
          item.update({'system.periciaCalculada.value': true});
        }
      });
    }

    html.find('.calculate-base').click( ev => {
      this.actor.update({'system.periciasCalculadas.value': true});
      this.actor.items.filter( item => item.type === 'pericia' )
                      .forEach( item => {
        const base = item.system.valorBase.value;
        let mod = 0
        if (item.system.caracteristica.value !== '') {
          mod = this.actor['system']['abilities'][item.system.caracteristica.value]['bonus'];
        }
        item.update({'system.cantidad.value': (base + mod) < 0 ? 0 : base + mod});
      });
    });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(header.dataset);
    if (type === 'spell') {
      // Move dataset spellLevelValue into spellLevel.value
      data.spellLevel = {
        'value': data.spellLevelValue
      };
      delete data.spellLevelValue;
    }
    if (type === 'pericia') {
      data.advanced = {
        'value': true
      }
    }
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data['type'];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    if (dataset.rollType) {
      // Handle weapon rolls.
      if (dataset.rollType === 'weapon') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        let label = dataset.label ? `<span class="chat-item-name">${game.i18n.localize('AXISMUNDIRPG.Roll')}: ${dataset.label}</span>` : `<span class="chat-item-name">${game.i18n.localize('AXISMUNDIRPG.Roll')}: Ataque ${dataset.attack === 'melee' ? 'cuerpo a cuerpo' : 'a distancia'} con ${item.name}</span>`;
        let rollFormula = 'd20';
        if (this.actor.type === 'character') {
          let attackBonus = 0;
          if (dataset.attack === 'melee') {
            attackBonus = this.actor.system.meleeAttackBonus.value;
            rollFormula += '+@str.bonus+' + this.actor.system.meleeAttackBonus.value;
          } else if (dataset.attack === 'ranged') {
            this.actor.system.meleeAttackBonus.value
            rollFormula += '+@dex.bonus+' + this.actor.system.rangedAttackBonus.value;;
          }
        } else if (this.actor.type === 'monster') {
          let attackBonus = 0;
          attackBonus = this.actor.system.attackBonus.value;
          rollFormula += '+' + attackBonus;
        }
        rollFormula += '+' + item.system.attackBonus.value;
        let roll = new Roll(rollFormula, this.actor.getRollData());
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
      }
      // Handle damage rolls.
      if (dataset.rollType === 'damage') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        let label = `<span class="chat-item-name">Tirada de daño: ${item.name}</span>`
        const rollFormula = `${item.system.damage.value}+${item.system.weaponType.value === 'r' ? this.actor.system.rangedDamageBonus.value : this.actor.system.meleeDamageBonus.value}`;
        const roll = new Roll(rollFormula, this.actor.getRollData());
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll;
      }

      // Handle item rolls.
      if (dataset.rollType === 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        
        if (item.type === 'pericia') {
          let label = `<span class="chat-item-name">Tirada de pericia: ${item.name}</span>`;
          const rollFormula = '1d6';
          const roll = new Roll(rollFormula, this.actor.getRollData());
          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: label,
            rollMode: game.settings.get('core', 'rollMode'),
          });
          return roll;
        }

        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `<span class="chat-item-name">${game.i18n.localize('AXISMUNDIRPG.Roll')}: ${dataset.label}</span>` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      await roll.roll();
      // label += successChatMessage(roll.total, dataset.targetNumber, dataset.rollUnder);
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  async _onItemPrepared(event) {
    const li = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(li.data('itemId'));
    const newValue = !item.system.prepared.value;
    item.update({'system.prepared.value': newValue});
  }

  async _onSizeChange(event) {
    this.actor.system.size.value = event.target.value;
    this.render(true);
  }

}
