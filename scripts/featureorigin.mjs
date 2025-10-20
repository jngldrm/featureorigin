class FeatureOrigin {

  static init() {
    Hooks.on("renderItemSheet5e", FeatureOrigin._advancementOrigin);
  }

  static _advancementOrigin(app, html) {
    const content = html instanceof HTMLElement ? html : html?.[0];
    if (!content) return;
    const actor = app.actor;
    if (!actor) return;
    if (app.object.type !== "feat" || app.object?.getFlag("dnd5e", "advancementOrigin")?.includes(".")) return;
    const current = app.object?.getFlag("dnd5e", "advancementOrigin");
    const choices = actor.items.reduce((acc, i) => {
      if (!i.system.advancement) return acc;
      acc.push({
        value: i.id,
        label: i.name,
        group: game.i18n.localize(`TYPES.Item.${i.type}`)
      });
      return acc;
    }, []).sort((a, b) => a.group.localeCompare(b.group));
    const selectOptionsHelper = globalThis.HandlebarsHelpers?.selectOptions ?? globalThis.Handlebars?.helpers?.selectOptions;
    const escape = (text) => {
      if (!text) return "";
      if (globalThis.foundry?.utils?.escapeHTML) return foundry.utils.escapeHTML(text);
      return `${text}`
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };
    const origins = selectOptionsHelper
      ? selectOptionsHelper(choices, { hash: { selected: current, sort: true } })
      : Object.entries(choices.reduce((acc, choice) => {
        (acc[choice.group] ??= []).push(choice);
        return acc;
      }, {})).map(([group, groupChoices]) => {
        const options = groupChoices
          .slice()
          .sort((a, b) => a.label.localeCompare(b.label))
          .map(({ value, label }) => {
            const selected = value === current ? " selected" : "";
            return `<option value="${escape(value)}"${selected}>${escape(label)}</option>`;
          }).join("");
        return `<optgroup label="${escape(group)}">${options}</optgroup>`;
      }).join("");
    const origin = `
      <div class="form-group">
        <label>${game.i18n.localize("FEATUREORIGIN.Label")}</label>
        <div class="form-fields">
          <select name="flags.dnd5e.advancementOrigin">
            <option></option>
            ${origins}
          </select>
        </div>
      </div>
    `;
    const type = content.querySelector('.form-group:has(select[name="system.type.subtype"])') ??
      content.querySelector('.form-group:has(select[name="system.type.value"])');
    if (!type) return;
    type.insertAdjacentHTML("afterend", origin);
  }
}

Hooks.once("init", FeatureOrigin.init);
