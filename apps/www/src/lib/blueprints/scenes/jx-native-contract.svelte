<!-- jx-native-contract blueprint: the shared Part A vocabulary — the
     unlayered class contract sliced out of jx-pure.css that the
     native-family components consume instead of the full face. The
     field stack (.jx-field/.jx-label), the bare control (.jx-control),
     and the native toggle-group (.jx-tgroup over radio labels). -->
<div class="flex h-full w-full flex-col justify-center gap-6 p-10">
  <div class="jx-field">
    <span class="jx-label">contract</span>
    <input class="jx-control" value="part-a.css" readonly />
  </div>
  <div class="jx-tgroup">
    <label><input type="radio" name="bp-jx-native-contract" checked /><span>css</span></label>
    <label><input type="radio" name="bp-jx-native-contract" /><span>svelte</span></label>
  </div>
</div>
