/**
 * The canonical language authority table
 * (lib/highlight/lang-canonical.ts, highlight-lang-detector, 2026-09-07).
 *
 * One versioned multi-line-string table answers the three questions every
 * detection layer needs: which canonical id a detection lands in, which
 * extensions/filenames/interpreters announce it, and which highlight
 * engines can render that id. L1/L2 and the betlang label map DERIVE from
 * this file (derive-then-diff law) — the data lives exactly once.
 *
 * ROW GRAMMAR (design D8.1, frozen): `<canonical> <k>=<v>…`, fields in
 * fixed order — canonical(SCALAR) betlang(SCALAR) ext(LIST) file(LIST,
 * omissible) interp(LIST, omissible) backend(LIST). Omitted field = empty
 * value (the design marks file/interp as omissible because they are the
 * COMMONLY-empty ones; backend omits only when NO engine renders the id —
 * ini today: detected by the frozen L3 probe and the betlang Ini label,
 * rejected by the matrix law on every backend). Any violation is a parse
 * error thrown at parse time, naming the field and the offending line.
 *
 * Comma law: a comma is ONLY a LIST separator — a comma inside a SCALAR,
 * a leading/trailing/consecutive comma (`,a` / `a,` / `a,,b`) and a
 * repeated list item are all parse errors. `#` starts a comment line;
 * blank lines are ignored; a k must not repeat within a row; a canonical
 * must not repeat across the table; ext/file/interp values must not
 * repeat across rows (cross-row duplicates would make two layers disagree
 * about one input).
 *
 * SOURCES (pinned; re-mining is a manual action that REPLACES the SHAs):
 *   - betlang =0.1.1 (crates.io, tarball sha256
 *     5f89b0929539eaee70109704ae4e345df438be6ab02e4dc8ac060e05098ad1b7)
 *     — the 48 model labels from src/language.rs, one mapping per row;
 *     unmapped labels stay absent (runtime null + one-shot warn, D4).
 *   - linguist languages.yml @5fb5096b95ab9893c5925d87121e5faaae9f3966
 *     — extensions/filenames/interpreters of the covered languages.
 *   - backend curated/alias snapshot @4c028ce13a796400a8df24dd9d0beb3c716e626a
 *     — the six engine factories' curated + alias tables (shiki, hljs,
 *     prismjs, sugar-high, tree-sitter, microlighter).
 *
 * MINING LAWS (the judgment calls, all mine-time, frozen in the data):
 *   - An extension covered by ANY heuristics.yml disambiguation block
 *     (138 blocks, 164 extensions) is left to L4 — EXCEPT `.ts`/`.tsx`/
 *     `.jsx`, which the spec scenario ("main.ts → L1 hits typescript")
 *     and design D3.1/D8.1 examples explicitly freeze into L1.
 *   - Extensions still claimed by several covered languages after that
 *     filter (.cgi/.fcgi/.spec/.pluginspec/.workflow) map to no row.
 *   - Multi-segment extensions (.sh.in, .json.example) are dead keys
 *     under the last-dot extraction law and are dropped.
 *   - The shared JS-runtime interpreters land on their primary runtime:
 *     node/nodejs/bun/d8/gjs/js/qjs/rhino/v8/v8-shell/chakra →
 *     javascript, deno/ts-node/tsx → typescript.
 *   - canonical ids for single-engine languages use that engine's own
 *     accepted input (objective-c, assembly — microlighter's grammar
 *     ids; the betlang labels ObjectiveC/Asm map onto them).
 *   - make/cmake have no rendering engine, no frozen probe and no
 *     betlang mapping, so they carry no row (design D3.1's BASENAME_TABLE
 *     block is a FORMAT illustration, not a content mandate).
 */

/** one parsed table row (all lists in written order, never reordered) */
export interface CanonicalRow {
  readonly canonical: string;
  /** the betlang 0.1.1 model label (Rust Debug form), or null = none */
  readonly betlang: string | null;
  readonly ext: readonly string[];
  readonly file: readonly string[];
  readonly interp: readonly string[];
  readonly backend: readonly string[];
}

/** the parsed table — rows in written order plus the derived views */
export interface CanonicalTable {
  readonly rows: readonly CanonicalRow[];
  /** lowercase extension (no dot) → canonical */
  readonly extMap: ReadonlyMap<string, string>;
  /** exact filename (case-sensitive, dotfiles included) → canonical */
  readonly basenameMap: ReadonlyMap<string, string>;
  /** interpreter basename (case-sensitive) → canonical */
  readonly interpMap: ReadonlyMap<string, string>;
  /** betlang model label → canonical (mapped rows only) */
  readonly betlangLabelMap: ReadonlyMap<string, string>;
}

export const CANONICAL_TABLE = `
# fields: canonical betlang= ext= file= interp= backend= (fixed order;
# file/interp/backend omit when empty). ext/file/interp are comma lists.
# ambiguous extensions (heuristics.yml blocks) stay out — L4 owns them —
# except the spec-frozen ts/tsx/jsx.

typescript betlang=TypeScript ext=ts,cts,mts interp=deno,ts-node,tsx backend=shiki,hljs,prismjs,sugar-high,tree-sitter,microlighter
tsx        betlang=-           ext=tsx backend=shiki,prismjs,tree-sitter,microlighter
javascript betlang=JavaScript ext=_js,bones,cjs,es6,frag,jake,javascript,js,jsb,jscad,jsfl,jslib,jsm,jspre,jss,mjs,njs,pac,sjs,ssjs,xsjs,xsjslib file=Jakefile interp=bun,chakra,d8,gjs,js,node,nodejs,qjs,rhino,v8,v8-shell backend=shiki,hljs,prismjs,sugar-high,tree-sitter,microlighter
jsx        betlang=-           ext=jsx backend=shiki,prismjs,sugar-high,tree-sitter,microlighter
svelte     betlang=-           ext=svelte backend=shiki,microlighter
vue        betlang=-           ext=vue backend=shiki,microlighter
html       betlang=Html ext=hta,htm,xht,xhtml backend=shiki,hljs,prismjs,sugar-high,microlighter
xml        betlang=Xml ext=adml,admx,ant,axaml,axml,ccproj,ccxml,clixml,cproject,cscfg,csdef,csproj,ct,depproj,dita,ditamap,ditaval,dotsettings,filters,fsproj,fxml,glade,gmx,gpx,grxml,gst,hzp,icls,iml,ivy,jelly,jsproj,kml,launch,mdpolicy,meta4,mjml,mm,mxml,natvis,ndproj,nproj,nuspec,odd,osm,pkgproj,proj,props,ps1xml,psc1,pt,pubxml,qhelp,rbxmx,rdf,resx,rss,sch,scxml,sfproj,shproj,slnx,srdf,storyboard,sublime-snippet,targets,tml,ui,urdf,ux,vbproj,vcxproj,vsixmanifest,vssettings,vstemplate,vxml,wixproj,wsdl,wsf,wxi,wxl,wxs,x3d,xacro,xaml,xib,xlf,xliff,xmi,xml,xmp,xproj,xsd,xspec,xul,zcml file=.classpath,.cproject,.project,App.config,NuGet.config,Settings.StyleCop,Web.Debug.config,Web.Release.config,Web.config,packages.config backend=hljs,prismjs,sugar-high
svg        betlang=-           ext=svg backend=prismjs
css        betlang=Css ext=css backend=shiki,hljs,prismjs,sugar-high,tree-sitter,microlighter
scss       betlang=-           ext=scss backend=shiki,hljs,prismjs,microlighter
json       betlang=Json ext=4dform,4dproject,avsc,code-snippets,code-workspace,geojson,gltf,har,hujson,json-tmlanguage,jsonc,jsonl,mcmeta,sarif,slnlaunch,sublime-build,sublime-color-scheme,sublime-commands,sublime-completions,sublime-keymap,sublime-macro,sublime-menu,sublime-mousemap,sublime-project,sublime-settings,sublime-theme,sublime-workspace,sublime_metrics,sublime_session,tfstate,topojson,webapp,webmanifest,yyp file=.all-contributorsrc,.arcconfig,.auto-changelog,.babelrc,.c8rc,.devcontainer.json,.eslintrc.json,.htmlhintrc,.imgbotconfig,.jscsrc,.jshintrc,.jslintrc,.nycrc,.oxlintrc.json,.secrets.baseline,.swcrc,.tern-config,.tern-project,.watchmanconfig,MODULE.bazel.lock,Package.resolved,Pipfile.lock,api-extractor.json,bun.lock,composer.lock,deno.lock,devcontainer.json,flake.lock,jsconfig.json,language-configuration.json,mcmod.info,tsconfig.json,tslint.json backend=shiki,hljs,prismjs,sugar-high,tree-sitter,microlighter
bash       betlang=Shell ext=bash,bats,command,ksh,pacscript,sbatch,sh,slurm,tmux,tool,trigger,zsh,zsh-theme file=.bash_aliases,.bash_functions,.bash_history,.bash_logout,.bash_profile,.bashrc,.cshrc,.envrc,.flaskenv,.kshrc,.login,.profile,.tmux.conf,.xinitrc,.xsession,.zlogin,.zlogout,.zprofile,.zshenv,.zshrc,9fs,PKGBUILD,bash_aliases,bash_logout,bash_profile,bashrc,cshrc,gradlew,kshrc,login,man,mvnw,profile,tmux.conf,xinitrc,xsession,zlogin,zlogout,zprofile,zshenv,zshrc interp=ash,bash,dash,ksh,mksh,pdksh,rc,sh,zsh backend=shiki,hljs,prismjs,sugar-high,microlighter
markdown   betlang=Markdown ext=livemd,markdown,mdown,mdwn,mkd,mkdn,mkdown,ronn,workbook file=contents.lr backend=shiki,hljs,prismjs,sugar-high,microlighter
yaml       betlang=Yaml ext=mir,reek,rviz,sublime-syntax,syntax,yaml-tmlanguage file=.clang-format,.clang-tidy,.clangd,.gemrc,CITATION.cff,glide.lock,pixi.lock,yarn.lock backend=shiki,hljs,prismjs,sugar-high,microlighter
ini        betlang=Ini ext=cfg,cnf,dof,ini,lektorproject,prefs file=.buckconfig,.coveragerc,.flake8,.gitreview,.pylintrc,HOSTS,buildozer.spec,hosts,pylintrc,vlcrc
plaintext  betlang=-           ext=nb,no file=CITATION,CITATIONS,COPYING,COPYING.regex,COPYRIGHT.regex,FONTLOG,INSTALL,INSTALL.mysql,LICENSE,LICENSE.mysql,NEWS,README.me,README.mysql,README.nss,README.pc,click.me,delete.me,keep.me,package.mask,package.use.mask,package.use.stable.mask,read.me,readme.1st,test.me,use.mask,use.stable.mask backend=shiki,sugar-high
python     betlang=Python ext=gyp,gypi,lmi,py,py3,pyde,pyi,pyp,pyt,pyw,tac,wsgi,xpy file=.gclient,DEPS,SConscript,SConstruct,wscript interp=py,pypy,pypy3,python,python2,python3,uv backend=sugar-high,microlighter
c          betlang=C ext=c,cats,idc interp=tcc backend=sugar-high,microlighter
cpp        betlang=Cpp ext=c++,cc,cp,cpp,cppm,cxx,h++,hpp,hxx,inl,ino,ipp,ixx,tcc,tpp,txx backend=sugar-high,microlighter
csharp     betlang=Cs ext=cake,csx,linq backend=sugar-high,microlighter
go         betlang=Go ext=go backend=sugar-high,microlighter
java       betlang=Java ext=jav,java,jsh backend=sugar-high,microlighter
rust       betlang=Rust interp=rust-script backend=sugar-high,microlighter
ruby       betlang=Ruby ext=builder,eye,gemspec,god,jbuilder,mspec,podspec,prawn,rabl,rake,rb,rbi,rbuild,rbw,rbx,ru,ruby,thor,watchr file=.irbrc,.pryrc,.simplecov,Appraisals,Berksfile,Brewfile,Buildfile,Capfile,Dangerfile,Deliverfile,Fastfile,Gemfile,Guardfile,Jarfile,Mavenfile,Podfile,Puppetfile,Rakefile,Snapfile,Steepfile,Thorfile,Vagrantfile,buildfile interp=jruby,macruby,rake,rbx,ruby backend=sugar-high,microlighter
kotlin     betlang=Kotlin ext=kt,ktm,kts backend=sugar-high,microlighter
swift      betlang=Swift ext=swift backend=sugar-high,microlighter
php        betlang=Php ext=aw,ctp,php3,php4,php5,phps,phpt file=.php,.php_cs,.php_cs.dist,Phakefile interp=php backend=sugar-high,microlighter
toml       betlang=Toml ext=toml file=Cargo.lock,Cargo.toml.orig,Gopkg.lock,Pipfile,mise.local.lock,mise.lock,pdm.lock,poetry.lock,uv.lock backend=sugar-high,microlighter
powershell betlang=Powershell ext=ps1,psd1,psm1 interp=pwsh backend=sugar-high,microlighter
dockerfile betlang=Dockerfile ext=containerfile,dockerfile file=Containerfile,Dockerfile backend=sugar-high,microlighter
graphql    betlang=-           ext=gql,graphql,graphqls backend=sugar-high,microlighter
hcl        betlang=-           ext=hcl,nomad,tf,tfvars,tofu backend=sugar-high
zig        betlang=-           ext=zig backend=sugar-high
lua        betlang=Lua ext=lua,nse,p8,pd_lua,rbxs,rockspec,wlua file=.luacheckrc interp=lua,luajit backend=sugar-high,microlighter
sql        betlang=Sql ext=ddl,mysql,prc,tab,udf,viw backend=sugar-high,microlighter
diff       betlang=-           ext=diff,patch backend=sugar-high
dart       betlang=Dart ext=dart interp=dart backend=microlighter
elixir     betlang=Elixir ext=exs file=mix.lock interp=elixir backend=microlighter
perl       betlang=Perl ext=perl,ph,plx,psgi file=.latexmkrc,Makefile.PL,Rexfile,ack,cpanfile,latexmkrc interp=cperl,perl backend=microlighter
r          betlang=R ext=rd,rhistory,rsx file=.Rapp.history,.Rhistory,.Rprofile,expr-dist interp=Rscript backend=microlighter
objective-c betlang=ObjectiveC backend=microlighter
assembly   betlang=Asm ext=a51,nas,nasm backend=microlighter
heex       betlang=-           ext=heex,leex backend=microlighter
`;

/** the field names in their fixed row order (the grammar's spelling) */
const FIELDS = ['betlang', 'ext', 'file', 'interp', 'backend'] as const;

/** ^[a-z0-9+#.-]+$ — the canonical id namespace (same as the card lang) */
const CANONICAL_ID = /^[a-z0-9+#.-]+$/;
/** a betlang model label (Rust Debug form, e.g. ObjectiveC) or '-' */
const BETLANG_LABEL = /^[A-Za-z0-9+#_-]+$/;
/** one LIST item — no commas, no whitespace, no '=' */
const LIST_ITEM = /^[A-Za-z0-9+#._-]+$/;

function parseError(field: string, line: string, detail: string): never {
  throw new Error(
    `[jixoai/highlight/lang-canonical] parse error in field "${field}" of line "${line.trim()}": ${detail}`,
  );
}

/**
 * Parse a canonical table. The default source parses ONCE per process
 * (module-level cache — every card shares it); an explicit source string
 * (the test fixtures) always parses fresh. Throws on any grammar
 * violation with the field name and the offending line in the message.
 */
export function parseCanonical(source: string = CANONICAL_TABLE): CanonicalTable {
  const rows: CanonicalRow[] = [];
  const extMap = new Map<string, string>();
  const basenameMap = new Map<string, string>();
  const interpMap = new Map<string, string>();
  const betlangLabelMap = new Map<string, string>();
  const canonicalSeen = new Set<string>();

  for (const rawLine of source.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;

    // tokens: the canonical id then the k=v fields in fixed order
    const tokens = trimmed.split(/\s+/);
    const [canonical, ...assignments] = tokens;
    if (!CANONICAL_ID.test(canonical)) {
      parseError('canonical', line, `illegal id "${canonical}"`);
    }
    if (canonicalSeen.has(canonical)) {
      parseError('canonical', line, `duplicate canonical "${canonical}"`);
    }

    const values = new Map<string, string[]>();
    let lastFieldIndex = -1;
    for (const assignment of assignments) {
      const eq = assignment.indexOf('=');
      if (eq <= 0) {
        parseError('row', line, `not a k=v pair: "${assignment}"`);
      }
      const key = assignment.slice(0, eq);
      const value = assignment.slice(eq + 1);
      const fieldIndex = (FIELDS as readonly string[]).indexOf(key);
      if (fieldIndex === -1) {
        parseError(key, line, 'unknown field name');
      }
      if (values.has(key)) {
        parseError(key, line, `field "${key}" repeats within the row`);
      }
      if (fieldIndex <= lastFieldIndex) {
        parseError(key, line, `field "${key}" is out of the fixed order`);
      }
      lastFieldIndex = fieldIndex;
      if (value === '') {
        parseError(key, line, `field "${key}" has an empty value`);
      }

      if (key === 'betlang') {
        // SCALAR — a comma here violates the comma law outright
        if (value.includes(',')) {
          parseError('betlang', line, 'SCALAR value contains a comma');
        }
        if (value !== '-' && !BETLANG_LABEL.test(value)) {
          parseError('betlang', line, `illegal label "${value}"`);
        }
        if (value !== '-' && betlangLabelMap.has(value)) {
          parseError('betlang', line, `duplicate betlang label "${value}"`);
        }
        values.set(key, [value]);
        continue;
      }
      // LIST — the comma law: no leading/trailing/consecutive commas, no
      // duplicate items; item shape checked per grammar
      const seen = new Set<string>();
      const items: string[] = [];
      let item = '';
      let any = false;
      for (const ch of value) {
        if (ch === ',') {
          if (!any) {
            parseError(key, line, 'leading or consecutive comma in list');
          }
          if (seen.has(item)) {
            parseError(key, line, `duplicate list item "${item}"`);
          }
          if (!LIST_ITEM.test(item)) {
            parseError(key, line, `illegal list item "${item}"`);
          }
          seen.add(item);
          items.push(item);
          item = '';
          any = false;
          continue;
        }
        item += ch;
        any = true;
      }
      if (!any) {
        parseError(key, line, 'trailing comma in list');
      }
      if (seen.has(item)) {
        parseError(key, line, `duplicate list item "${item}"`);
      }
      if (!LIST_ITEM.test(item)) {
        parseError(key, line, `illegal list item "${item}"`);
      }
      items.push(item);
      values.set(key, items);
    }

    const field = (name: (typeof FIELDS)[number]): readonly string[] =>
      values.get(name) ?? [];
    if (field('betlang').length === 0) {
      parseError('betlang', line, 'the betlang field is required (use - when none)');
    }

    // cross-row uniqueness: one input, one answer — a shared ext/file/
    // interp value would make layers disagree
    for (const ext of field('ext')) {
      if (extMap.has(ext)) {
        parseError('ext', line, `extension "${ext}" appears in more than one row`);
      }
      extMap.set(ext, canonical);
    }
    for (const file of field('file')) {
      if (basenameMap.has(file)) {
        parseError('file', line, `filename "${file}" appears in more than one row`);
      }
      basenameMap.set(file, canonical);
    }
    for (const interp of field('interp')) {
      if (interpMap.has(interp)) {
        parseError('interp', line, `interpreter "${interp}" appears in more than one row`);
      }
      interpMap.set(interp, canonical);
    }
    const betlang = field('betlang')[0] === '-' ? null : field('betlang')[0];
    if (betlang !== null) betlangLabelMap.set(betlang, canonical);

    canonicalSeen.add(canonical);
    rows.push({
      canonical,
      betlang,
      ext: field('ext'),
      file: field('file'),
      interp: field('interp'),
      backend: field('backend'),
    });
  }

  return { rows, extMap, basenameMap, interpMap, betlangLabelMap };
}

let cached: CanonicalTable | undefined;

/** the process-level cached parse of the shipped table */
export function canonicalTable(): CanonicalTable {
  cached ??= parseCanonical();
  return cached;
}

/** lowercase extension (no dot) → canonical — L1's ext view */
export function getExtMap(): ReadonlyMap<string, string> {
  return canonicalTable().extMap;
}

/** exact filename (case-sensitive) → canonical — L1's basename view */
export function getBasenameMap(): ReadonlyMap<string, string> {
  return canonicalTable().basenameMap;
}

/** interpreter basename → canonical — L2's view */
export function getInterpMap(): ReadonlyMap<string, string> {
  return canonicalTable().interpMap;
}

/** betlang model label → canonical (mapped labels only) — L4's view */
export function getBetlangLabelMap(): ReadonlyMap<string, string> {
  return canonicalTable().betlangLabelMap;
}
