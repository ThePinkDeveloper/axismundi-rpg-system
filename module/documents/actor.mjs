/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class AxisMundiRPGActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
    const actorData = this;

    // Make separate methods for each Actor type to keep things organized.
    this._prepareCharacterData(actorData);
    this._prepareMonsterData(actorData);
    this._prepareSiegeEngineData(actorData);
    this._prepareStrongholdData(actorData);
    this._prepareVehicleData(actorData);
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;

    // Make separate methods for each Actor type to keep things organized.
    this._prepareCharacterDerivedData(actorData);
    this._prepareMonsterDerivedData(actorData);
    this._prepareSiegeEngineDerivedData(actorData);
    this._prepareStrongholdDerivedData(actorData);
    this._prepareVehicleDerivedData(actorData);
  }


  /**
   * Prepare Character type template data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;
  }

  /**
   * Prepare Character type derived data
   */
  _prepareCharacterDerivedData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const data = actorData.system;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.abilities)) {
      // Calculate the ability bonus
      ability.bonus = this._calculateAbilityBonus(ability.value);
    }

  }

  /**
   * Determine ability score modifiers
   */
  _calculateAbilityBonus(abilityScore) {
    switch (abilityScore) {
      case 3: return -3;
      case 4:
      case 5: return -2;
      case 6:
      case 7:
      case 8: return -1;
      case 13:
      case 14:
      case 15: return 1;
      case 16:
      case 17: return 2;
      case 18: return 3;
      default: return 0;
    }
  }


  /**
   * Prepare Monster type template data.
   */
  _prepareMonsterData(actorData) {
    if (actorData.type !== 'monster') return;

    const data = actorData.system;

    data.attackBonus.value = this._calculateMonsterAttackBonus();
    this._calculateSavesValues(data);
  }

  _calculateSavesValues(data) {
    const savesMap = this._fillMonstersSaves();
    data.saves.paralysis.value = savesMap.get(data.monsterSaves.value)[0];
    data.saves.death.value = savesMap.get(data.monsterSaves.value)[1];
    data.saves.breath.value = savesMap.get(data.monsterSaves.value)[2];
    data.saves.wands.value = savesMap.get(data.monsterSaves.value)[3];
    data.saves.spells.value = savesMap.get(data.monsterSaves.value)[4];
  }

  /**
   * Calculate monster attack bonus
   */
  _calculateMonsterAttackBonus() {
    const hitDiceNumber = this.system.hitDice.number;
    if (hitDiceNumber < 1) {
      return 0;
    } else if (hitDiceNumber > 31) {
      return 16;
    }
    switch (hitDiceNumber) {
      case 9: return 8;
      case 10:
      case 11: return 9
      case 12:
      case 13: return 10;
      case 14:
      case 15: return 11;
      case 16:
      case 17:
      case 18:
      case 19: return 12;
      case 20:
      case 21:
      case 22:
      case 23: return 13;
      case 24:
      case 25:
      case 26:
      case 27: return 14;
      case 28:
      case 29:
      case 30:
      case 31: return 15;
      default: return hitDiceNumber; // this handles 1-9
    }
  }

  /**
   * Prepare Monster type derived data.
   */
  _prepareMonsterDerivedData(actorData) {
    if (actorData.type !== 'monster') return;
  }


  /**
   * Prepare Siege Engine type template data
   */
  _prepareSiegeEngineData(actorData) {
    if (actorData.type !== 'siegeEngine') return;
  }

  /**
   * Prepare Siege Engine type derived data
   */
  _prepareSiegeEngineDerivedData(actorData) {
    if (actorData.type !== 'siegeEngine') return;
  }

  /**
   * Prepare Stronghold type template data
   */
  _prepareStrongholdData(actorData) {
    if (actorData.type !== 'stronghold') return;

    const data = actorData.system;
    const floors = actorData.itemTypes.floor;
    const walls = actorData.itemTypes.wall;

    floors.forEach(floor => {
      switch (floor.system.material.value) {
        case 'roofSlate': floor.system.price.value = floor.system.area.value / 10 * 4; break;
        case 'roofWood': floor.system.price.value = floor.system.area.value / 10 * 2; break;
        case 'floor':
        case 'roofThatch':
        default: floor.system.price.value = floor.system.area.value / 10; break;
      }
    });

    walls.forEach(wall => {
      switch (wall.system.material.value) {
        case 'stoneHard':
          wall.system.hardness.value = 16;
          switch (wall.system.thickness.value) {
            case 15: wall.system.price.value = 350; break;
            case 10: wall.system.price.value = 260; break;
            case 5: wall.system.price.value = 90; break;
            default: wall.system.price.value = 40; break;
          }
          break;
        case 'stoneSoft':
          wall.system.hardness.value = 12;
          switch (wall.system.thickness.value) {
            case 10: wall.system.price.value = 200; break;
            case 5: wall.system.price.value = 70; break;
            default: wall.system.price.value = 30; break;
          }
          break;
        case 'brick':
          wall.system.hardness.value = 8;
          switch (wall.system.thickness.value) {
            case 5: wall.system.price.value = 50; break;
            default: wall.system.price.value = 20; break;
          }
          break;
        case 'wood':
        default:
          wall.system.hardness.value = 6;
          wall.system.thickness.value = 1;
          wall.system.price.value = 10;
          break;
      }
      wall.system.price.value *= wall.system.quantity.value;
    });
  }

  /**
   * Prepare Stronghold type derived data
   */
  _prepareStrongholdDerivedData(actorData) {
    if (actorData.type !== 'stronghold') return;

    const data = actorData.system;
    const floors = actorData.itemTypes.floor;
    const walls = actorData.itemTypes.wall;

    let totalCost = 0;
    let totalHeight = 0;
    floors.forEach(floor => {
      totalHeight += floor.system.height.value;
      totalCost += floor.system.price.value;
    });
    walls.forEach(wall => {
      totalCost += wall.system.price.value;
    });

    data.height = {
      "value": totalHeight,
      "label": 'AXISMUNDIRPG.Height'
    };

    data.cost = {
      "value": (totalCost + (totalCost * (totalHeight / 100))) * data.costMultiplier.value, // each 10' of height adds 10% to the costs in both time and money
      "label": 'AXISMUNDIRPG.Cost'
    };

    data.buildTime = {
      "value": Math.ceil(Math.max(data.cost.value / data.workers.value, Math.sqrt(data.cost.value))),
      "label": 'AXISMUNDIRPG.BuildTime'
    };
  }


  /**
   * Prepare Vehicle type template data
   */
  _prepareVehicleData(actorData) {
    if (actorData.type !== 'vehicle') return;

    const data = actorData.system;
    data.hitPoints.value = 0;
    data.hitPoints.max = 0;

    // Calculate totals for HP value and HP max
    for (let [key, side] of Object.entries(data.hitPoints)) {
      if (['forward', 'aft', 'port', 'starboard'].includes(key)) {
        data.hitPoints.value += side.value;
        data.hitPoints.max += side.max;
      }
    }
  }

  /**
   * Prepare Vehicle type derived data
   */
  _prepareVehicleDerivedData(actorData) {
    if (actorData.type !== 'vehicle') return;

    const data = actorData.system;

    // Check if any 1 or 2 sides are reduced to 0 HP
    let sidesAtZeroHP = 0;
    for (let [key, side] of Object.entries(data.hitPoints)) {
      if (['forward', 'aft', 'port', 'starboard'].includes(key) && side.value === 0 && side.max !== 0) {
        ++sidesAtZeroHP;
      }
    }
    if (sidesAtZeroHP === 1) {
      data.move.current = Math.floor(data.move.value / 2);
    } else if (sidesAtZeroHP > 1) {
      data.move.current = 0;
    } else {
      data.move.current = data.move.value;
    }
  }


  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getMonsterRollData(data);
    this._getSiegeEngineRollData(data);
    this._getStrongholdRollData(data);
    this._getVehicleRollData(data);
    this._getActorRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.bonus + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.level) {
      data.lvl = data.level.value ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getMonsterRollData(data) {
    if (this.type !== 'monster') return;

    // Process additional NPC data here.

  }

  /**
   * Prepare Siege Engine roll data.
   */
  _getSiegeEngineRollData(data) {
    if (this.type !== 'siegeEngine') return;

    // Process additional Siege Engine data here.

  }

  /**
   * Prepare Stronghold roll data.
   */
  _getStrongholdRollData(data) {
    if (this.type !== 'stronghold') return;

    // Process additional Stronghold data here.

  }

  /**
   * Prepare Vehicle roll data.
   */
  _getVehicleRollData(data) {
    if (this.type !== 'vehicle') return;

    // Process additional Vehicle data here.

  }

  /**
   * Prepare shared Actor roll data.
   */
  _getActorRollData(data) {
    // Add attack bonus for easier access, or fall back to 0.
    if (data.attackBonus) {
      data.ab = data.attackBonus.value ?? 0;
    }
  }


  _fillMonstersSaves() {
    const map = new Map();
    map.set(1, [15, 14, 16, 16, 17]);
    map.set(2, [14, 13, 15, 15, 16]);
    map.set(3, [14, 13, 15, 15, 16]);
    map.set(4, [13, 12, 14, 14, 15]);
    map.set(5, [12, 11, 13, 13, 14]);
    map.set(6, [12, 11, 13, 13, 14]);
    map.set(7, [11, 10, 12, 12, 13]);
    map.set(8, [10, 9, 11, 11, 12]);
    map.set(9, [10, 9, 11, 11, 12]);
    map.set(10, [9, 8, 10, 10, 11]);
    map.set(11, [8, 7, 9, 9, 10]);
    map.set(12, [8, 7, 9, 9, 10]);      
    map.set(13, [7, 6, 8, 8, 9]);
    map.set(14, [6, 5, 7, 7, 8]);
    return map;
  }
}