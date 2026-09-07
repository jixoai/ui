<script lang="ts">
  import Icon from './ui/icon';
  // the scanned literals below ARE the dogfood: the plugin's scanner
  // collects these name attributes from source, packs the referenced
  // hmos: artwork, and the template union admits hmos:${string}
</script>

<main>
  <h1>hmos:* — a third-party channel over local svgs</h1>
  <ul>
    <li><Icon name="hmos:ic_public_pause" /></li>
    <li><Icon name="hmos:ic_public_themes" size={32} /></li>
    <li><Icon name="hmos:ic_public_appstore" /></li>
    <li><Icon name="hmos:ic_device_watch_fit_filled" /></li>
    <li><Icon name="hmos:ic_public_calendar" size={32} /></li>
    <li><Icon name="hmos:ic_public_security" /></li>
    <li><Icon name="hmos:ic_public_voice" size={32} /></li>
    <li><Icon name="hmos:ic_public_drawer_filled" /></li>
    <li><Icon name="hmos:ic_contacts_calllog_doubleline_2" /></li>
    <li><Icon name="hmos:ic_public_switch_camera" /></li>
    <!-- the config lane: a ref whose FILENAME carries a space — legal
         in library.icons refs (only scanning requires space-free) -->
    <li><Icon name="editGroup" /></li>
    <!-- lucide rides beside the custom channel, default-registered -->
    <li><Icon name="lucide:check" /></li>
  </ul>
</main>
