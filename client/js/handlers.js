// handlers.js

// Assure-toi que le module 'types' est bien disponible
// et que 'EntityFactory' et 'Player' sont dans le mÃªme dossier ou accessibles

define(['player', 'entityfactory', 'types'], function(Player, EntityFactory, Types) {
  return {
      [Types.Messages.WELCOME]: function(data) {
          const [_, id, name, x, y, hp] = data;
          if (this.welcome_callback) this.welcome_callback(id, name, x, y, hp);
      },

      [Types.Messages.MOVE]: function(data) {
          const [_, id, x, y] = data;
          if (this.move_callback) this.move_callback(id, x, y);
      },

      [Types.Messages.LOOTMOVE]: function(data) {
          const [_, id, item] = data;
          if (this.lootmove_callback) this.lootmove_callback(id, item);
      },

      [Types.Messages.ATTACK]: function(data) {
          const [_, attacker, target] = data;
          if (this.attack_callback) this.attack_callback(attacker, target);
      },

      [Types.Messages.SPAWN]: function(data) {
          const [_, id, kind, x, y] = data;

          if (Types.isItem(kind) || Types.isChest(kind)) {
              const item = EntityFactory.createEntity(kind, id);
              const callback = Types.isItem(kind) ? this.spawn_item_callback : this.spawn_chest_callback;
              if (callback) callback(item, x, y);
          } else {
              let name, orientation, target, weapon, armor;
              if (Types.isPlayer(kind)) {
                  [name, orientation, armor, weapon, target] = data.slice(5);
              } else if (Types.isMob(kind)) {
                  [orientation, target] = data.slice(5);
              }

              const character = EntityFactory.createEntity(kind, id, name);
              if (character instanceof Player) {
                  character.weaponName = Types.getKindAsString(weapon);
                  character.spriteName = Types.getKindAsString(armor);
              }

              if (this.spawn_character_callback) {
                  this.spawn_character_callback(character, x, y, orientation, target);
              }
          }
      },

      [Types.Messages.DESPAWN]: function(data) {
          if (this.despawn_callback) this.despawn_callback(data[1]);
      },

      [Types.Messages.HEALTH]: function(data) {
          if (this.health_callback) this.health_callback(data[1], !!data[2]);
      },

      [Types.Messages.CHAT]: function(data) {
          if (this.chat_callback) this.chat_callback(data[1], data[2]);
      },

      [Types.Messages.EQUIP]: function(data) {
          if (this.equip_callback) this.equip_callback(data[1], data[2]);
      },

      [Types.Messages.DROP]: function(data) {
          const [_, mobId, id, kind, playersInvolved] = data;
          const item = EntityFactory.createEntity(kind, id);
          item.wasDropped = true;
          item.playersInvolved = playersInvolved;
          if (this.drop_callback) this.drop_callback(item, mobId);
      },

      [Types.Messages.TELEPORT]: function(data) {
          if (this.teleport_callback) this.teleport_callback(data[1], data[2], data[3]);
      },

      [Types.Messages.DAMAGE]: function(data) {
          if (this.dmg_callback) this.dmg_callback(data[1], data[2]);
      },

      [Types.Messages.POPULATION]: function(data) {
          if (this.population_callback) this.population_callback(data[1], data[2]);
      },

      [Types.Messages.LIST]: function(data) {
          if (this.list_callback) this.list_callback(data.slice(1));
      },

      [Types.Messages.DESTROY]: function(data) {
          if (this.destroy_callback) this.destroy_callback(data[1]);
      },

      [Types.Messages.KILL]: function(data) {
          if (this.kill_callback) this.kill_callback(data[1]);
      },

      [Types.Messages.HP]: function(data) {
          if (this.hp_callback) this.hp_callback(data[1]);
      },

      [Types.Messages.BLINK]: function(data) {
          if (this.blink_callback) this.blink_callback(data[1]);
      }
  };
});