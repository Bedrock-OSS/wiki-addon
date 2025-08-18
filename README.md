# Bedrock Examples

This repository contains example behavior and resource packs, used for showcasing various mechanics on the Bedrock Wiki.
You can find the latest downloads [here](https://github.com/Bedrock-OSS/bedrock-examples/releases/tag/download).

## Adding Resources

Please, follow this [style guide](https://wiki.bedrock.dev/meta/style-guide.html)!
After your commit, packs in the "Downloads" release will be updated.

Please add a `meta.json` file to the root of the pack with the name, type, and tags keys set. For example:

```json
{
    "name": "Custom Item Models",
    "type": "mcaddon",
    "tags": ["items"]
}
```

- `name` - the name for the add-on
- `type` - "mcaddon", "mcpack" or "zip", used to determine how the add-on should be packaged.
- `archive_root` - optional root subfolder to create the archive from, useful when packaging as "mcpack".
- `tags` - optional should include what is included in the add-on e.g. "blocks", "items", "entities"

```json
{
    "name": "mcfunction timers",
    "type": "mcpack",
    "archive_root": "bp",
    "tags": ["functions"]
}
```
