# quietmachineworks

[English](#english) | [Français](#français)

## English

Small, opinionated tools for solo developers shipping real projects. One plugin,
one install, eleven skills, plus a help map and a full-cycle passage.

```
/plugin marketplace add quietmachineworks/qmw
/plugin install qmw@quietmachineworks
```

Or with the skills CLI, for any agent that reads `SKILL.md`:

```bash
npx skills add quietmachineworks/qmw
```

Installed as a plugin, `/qmw:help` prints the skills and the moment each one
belongs to. It and `/qmw:full-cycle` are invoked by hand only, never picked by
the agent on its own. Every skill still pays its description on every prompt of
every session, whether it fires or not; that price is what `/qmw:audit-agent` is
built to measure, on this plugin as much as on any other.

The skills that audit (`audit-rules`, `audit-codebase`, `check-release`,
`status`) have the write and edit tools removed from their pool for the turn,
so "writes nothing" is held by the harness and not only by the text. The
skills that change a tree and drive a browser (`run-qa`, `fix-bug`,
`upgrade-deps`, `build-feature`) run only when you type them.

How the pieces fit together - the two disciplines, the order the skills feed each
other in, the shared state root, the three roles they delegate into - is
[METHOD.md](METHOD.md). For a full review, `/qmw:full-cycle` runs the whole
cycle in one guided passage, gate by gate.

### audit-rules and freeze-rule - make a rule enforce itself

A rule written in `CLAUDE.md`, `AGENTS.md` or a style guide is an intention.
Nothing applies it. Banning the pattern outright does not work either: on a
repository that already breaks the rule, every existing case would have to be
fixed before the check can go on, so it never goes on. A ratchet freezes what the
repository already carries, fails when that number rises, and lets it fall.

```
/qmw:audit-rules
```

Reads what your project already states, and sorts every rule into three piles:
already covered by a linter, mechanizable but unenforced with the count it
currently reaches, and judgment calls no check should approximate. Writes
nothing. The middle pile is usually much larger than expected.

```
/qmw:freeze-rule no TODO comments in application code
```

Builds the check for one rule, freezes today's count as the baseline, and wires
it into CI.

### audit-codebase - the whole codebase at once

The whole codebase read at once and handed back as a defect list, ordered by
what costs the most first. It repairs nothing; you decide what gets fixed and
what you can live with.

```
/qmw:audit-codebase
```

Audits the entire codebase, or just the perimeters you pick (front, back,
mobile, infra), under nine lenses: design, duplication and reinvention,
over-engineering, superseded patterns, dead weight, inconsistency, boundary
hygiene, performance shapes, test debt. Everything is judged against the stack
the project actually runs, never against last month's release, and never
against your own written conventions, which outrank generic best practice.
Reports and prioritizes, fixes nothing, writes nothing: every repair is a
follow-up you ask for after reading it.

### refactor - one repair, nothing else moves

The repair work that follows an audit. It takes one finding at a time, and the
code leaves able to do everything it could when it arrived. A change that alters
behavior has failed, however clean the diff: nobody asked for a different product.

```
/qmw:refactor <a finding from the audit, or a defect class named directly>
```

Re-verifies the finding against the tree as it stands, enumerates every carrier
of the class, pins current behavior before anything moves (the project's gate,
plus characterization tests where the touched code has none), then closes the
class rather than patching the sites. Proof that nothing observable changed:
the pin replayed, the finding's count re-measured to zero, touched screens
walked in a browser, and a fresh-eyed sub-agent judging the diff against the
mandate alone. One intervention, one commit, one entry in `.qmw/refactor/log.md`. A
bug discovered mid-repair is handed off, never silently corrected inside a
restructuring commit.

### build-feature - one change built and proven to land

The forward twin of refactor: it builds new behavior into a product that already
works and proves it lands, without disturbing what worked yesterday. Refactor
proves nothing observable changed; this proves the one intended thing changed
and nothing else did.

```
/qmw:build-feature <the intention: what must land, in the words of whoever will use it>
```

States what must land and what must not move, pins the surfaces that have to
survive the change (the gate, plus characterization tests where they are
untested), builds the one intention, then proves it the way a bug fix is proven:
the gesture played through until it actually lands (in a browser for a front
end, at every declared breakpoint), a regression test at the level the behavior
lives, and fresh eyes on the diff judging both that the intention landed and
that nothing the mandate held has moved. One intention, one commit, one entry in
`.qmw/build-feature/log.md`. A bug found mid-build is handed to fix-bug, never
folded into the build commit. For routine edits, use the base tools; reach for
this when a change is worth proving.

### upgrade-deps - dependencies raised one proven step at a time

Work from a list, one item at a time, and never leave the tree in a state that
would not ship: at every commit it installs, builds and passes its gate. The
usual alternative is one heroic upgrade-everything branch that dies unmerged.

```
/qmw:upgrade-deps
```

Builds the upgrade list from every manifest the repository carries, priced:
advisories, majors, the minor-and-patch remainder. Advisories first, majors
alone (one name, one raise, one commit, so a regression bisects to one name),
version-locked families moved together, minors batched under the gate. Each
raise is read before it happens - the real release notes, intersected with
actual usage in the code - and proven after: clean install, build, gate. What
cannot be raised cleanly is reverted and held, with the price of unblocking it
written into `.qmw/upgrade-deps/log.md`, which is the next run's starting point.
Every commit left behind is a tree where install, build and gate pass.

### run-qa - play a real user before real users do

Test suites only ever exercise clean, fabricated worlds. The bugs that reach real
users are disproportionately the ones a clean-world suite structurally cannot
see: the second time a unique gesture is repeated, the account with a hundred
rows instead of ten, the guard that reads the wrong element of a list.

```
/qmw:run-qa
```

A genuinely empty environment, personas born from real signup, real clicks, until
every intention in scope actually lands. Sub-agents execute; a separate
controller judges each result as an expert practitioner of the tested persona's
real job, not as a generic first-time user. Every finding lands in a living
registry, kept up to date screen by screen.

Front-end products only, driven through a browser by accessibility tree and
locators. The first run interviews you and writes the answers into `.qmw/run-qa/`
at the project root, versioned like any other project decision.

### fix-bug - one reported bug, from incident to proven fix

A fix written from the bug's description alone fixes the description. And
whoever just spent an hour on a fix is the worst-placed person alive to judge
whether it worked.

```
/qmw:fix-bug a user says they paid and the invoice still shows unpaid
```

Logs the report verbatim with its screenshots, reproduces it in a real browser
before touching any code, chases the cause past the guard that revealed it,
fixes the class rather than the sites, then proves the fix the way the bug was
found: the reporter's exact path replayed from a clean session, held to four
axes - functional, visual, UX, UI at every declared viewport - and signed off by
fresh eyes that never saw the fix. Every incident keeps its before/after
captures, root cause and regression test in `.qmw/fix-bug/`, so the same report never
costs a second investigation.

The reactive counterpart to run-qa, with the same standard of proof - and no
dependency on it.

### check-release - the release checklist, executed

The run a build makes before delivery: not one more inspection of the working
tree, the release actually built and exercised the way production will. The
paperwork says ready; running it finds out.

```
/qmw:check-release
```

The current commit built from a clean clone (the leg that catches the file that
only exists locally and the dependency never declared), the artifact that would
ship opened and inspected both ways, migrations played forward from the last
released state rather than the dev database, changelog and version bump judged
against the actual diff since the last tag, and the built product smoked the
way production starts it, never the dev server. Ends on a go or no-go bound to
one commit: any change to the tree voids the verdict and the trial runs again.
Fixes nothing, writes nothing; every blocker is a follow-up you ask for after
the verdict.

### audit-agent - what the agent carries, and what it earns

An agent's manifest is everything it carries into every prompt: what each item
is, what it costs, and why it is still installed. The other skills audit your
code. This one audits the agent reading it.

```
/qmw:audit-agent
```

Inventories the skills, commands, subagents, hooks, MCP servers and plugins that
are installed, and prices each one against what it actually did. Where `status` reads the work qmw produced, this reads the agent that produced it.
Standing cost is
paid on every prompt, whether a skill fires daily or never; a hook on `Bash` runs
on every shell call with its timeout as the worst case. Usage comes from the
session transcripts rather than the typed history, because the skills that work
best are the ones nobody ever had to type. Every count carries the window it was
measured over, and what could not be measured is never struck on silence.

The finding nobody looks for is shadowing: two descriptions claiming the same
trigger do not split the work, one wins and the other never fires, whatever its
quality. That is why a good skill looks dormant.

```
/qmw:audit-agent find <subject>
```

What already covers the need, aboard first, then what the ecosystem offers -
compared on fit, real cost (a plugin installed for one skill imports all of them,
plus its hooks), and trust, since a skill is instructions your agent will follow.
Recommends, never installs. The third verdict is offered every time: write the
three lines yourself.

```
/qmw:audit-agent clean
```

The deprisation plan, one block per item, approved line by line. What a registry
can reinstall gets removed with its restore command; what exists only on your
machine gets archived, never deleted. Config is backed up before anything is
touched, and silence is not approval.

### status - where the work stands

The running record of what has been done, read when you pick a codebase back up
so the work continues where it was left rather than from a blank slate. qmw
writes as it works: incidents in `.qmw/fix-bug/`, interventions in
`.qmw/refactor/log.md`, raised and held dependencies in `.qmw/upgrade-deps/log.md`, a
living registry in `.qmw/run-qa/`.

```
/qmw:status
```

Reads those records and reports where the work stands: the bugs still open, the
changes landed and the next one they named, the dependencies held with the price
of unblocking each, the last release verdict. Details what needs a decision,
lists the rest, and closes on the record's own next step handed back as an
invocation. Reads the records, never re-runs the skills; writes nothing.

### full-cycle - the whole review cycle, one passage

A full cycle takes a codebase through the whole review in one pass, not one
repair. Most of the time a single skill reached for directly is the right tool;
for the whole thing at once, this runs the cycle in order.

```
/qmw:full-cycle
```

Audit-codebase, then a refactor for each finding you pick, upgrade-deps, a
run-qa, and a check-release that ends on a go or no-go for the tag. It
orchestrates and gates; it
does not do the work itself, and it never skips the gate between legs, where
silence is not approval. Invoked by hand only, like `/qmw:help`: an
orchestrator has nothing to say until you type it.

### Adding a skill here

One repository, one plugin, one release. A new skill is a folder under `skills/`
whose name is what people will type after `/qmw:`, a `SKILL.md` whose frontmatter
`name` matches that folder, a mention in this README and in the `/qmw:help` map,
and a line under Unreleased in the changelog. A skill that audits declares
`disallowed-tools: Write, Edit, NotebookEdit`. `node test/repo.mjs` checks all
of it, and CI runs it: a skill nobody can invoke, or a README that invokes one
that does not exist, fails the build rather than a stranger's install.

### License

MIT, see [LICENSE](LICENSE).

---

## Français

Des outils courts et assumés, pour les développeurs seuls qui livrent de vrais
projets. Un plugin, une installation, onze skills, plus une carte d'aide et un
cycle complet.

```
/plugin marketplace add quietmachineworks/qmw
/plugin install qmw@quietmachineworks
```

Une fois le plugin installé, `/qmw:help` affiche les skills et le moment auquel
chaque skill appartient. `/qmw:help` et `/qmw:full-cycle` ne se lancent qu'à la
main, jamais choisis par l'agent tout seul. Chaque skill paie quand même sa
description à chaque prompt de chaque session, qu'elle se déclenche ou non ; ce
prix est exactement ce que `/qmw:audit-agent` est fait pour mesurer, sur ce
plugin comme sur n'importe quel autre.

Les skills qui auditent (`audit-rules`, `audit-codebase`, `check-release`,
`status`) se voient retirer les outils d'écriture et d'édition pour le tour, si
bien que « n'écrit rien » tient par le harnais et pas seulement par le texte.
Les skills qui modifient l'arbre et pilotent un navigateur (`run-qa`,
`fix-bug`, `upgrade-deps`, `build-feature`) ne tournent que quand tu les tapes.

Comment les pièces s'emboîtent (les deux disciplines, l'ordre dans lequel les
skills se passent le travail, la racine d'état partagée, les trois rôles), c'est
[METHOD.md](METHOD.md). Pour une revue complète, `/qmw:full-cycle` déroule tout
le cycle en une passe guidée, porte après porte.

### audit-rules et freeze-rule - qu'une règle s'applique d'elle-même

Une règle écrite dans `CLAUDE.md`, `AGENTS.md` ou un guide de style est une
intention. Rien ne l'applique. Interdire le motif d'un coup ne marche pas non
plus : sur un dépôt qui enfreint déjà la règle, il faudrait corriger tous les cas
existants avant de pouvoir activer le contrôle, donc il n'est jamais activé. Un
cliquet gèle ce que le dépôt porte déjà, échoue quand ce nombre monte, et le
laisse descendre.

`/qmw:audit-rules` lit ce que ton projet énonce déjà et trie chaque règle en
trois tas : déjà couverte par un linter, mécanisable mais non appliquée avec le
compte qu'elle atteint aujourd'hui, et jugement qu'aucun contrôle ne doit
approximer. N'écrit rien. Le tas du milieu est presque toujours plus gros que
prévu.

`/qmw:freeze-rule <la règle>` construit le contrôle, gèle le compte du jour comme
référence, et le branche dans la CI.

### audit-codebase - tout le code d'un coup

Tout le code lu d'un coup et rendu sous forme de liste de défauts, triée par ce
qui coûte le plus cher d'abord. Ne répare rien ; tu décides ce qui se corrige et
ce avec quoi tu peux vivre.

`/qmw:audit-codebase` audite la totalité du code, ou seulement les périmètres choisis
(front, back, mobile, infra), sous neuf angles : conception, duplication et
réinvention, sur-ingénierie, patterns dépassés, code mort, incohérences,
hygiène des frontières, formes de performance, dette de tests. Tout est jugé
contre la stack que le projet fait réellement tourner, jamais contre la
release du mois dernier, et jamais contre tes propres conventions écrites, qui
priment sur les bonnes pratiques génériques. Rapporte et priorise, ne corrige
rien, n'écrit rien : chaque réparation est une suite que tu demandes après
lecture.

### refactor - une réparation, rien d'autre ne bouge

La réparation qui suit un audit. Elle prend un constat à la fois, et le code
repart capable de tout ce qu'il savait faire en arrivant. Un changement qui
altère le comportement a échoué, aussi propre que soit le diff : personne n'a
demandé un autre produit.

`/qmw:refactor <un constat du rapport, ou une classe de défaut nommée>` revérifie
le constat contre l'arbre tel qu'il est, énumère tous les porteurs de la
classe, épingle le comportement courant avant de bouger quoi que ce soit (le
gate du projet, plus des tests de caractérisation là où le code touché n'en a
pas), puis ferme la classe au lieu de rapiécer les occurrences. Preuve que rien
d'observable n'a bougé : l'épingle rejouée, le compte du constat remesuré à
zéro, les écrans touchés parcourus dans un navigateur, et un sous-agent au
regard neuf qui juge le diff contre le seul mandat. Une intervention, un
commit, une entrée dans `.qmw/refactor/log.md`. Un bug découvert en cours de
réparation est transmis, jamais corrigé en silence dans un commit de
restructuration.

### build-feature - un changement construit et prouvé qu'il atterrit

Le jumeau avant de refactor : il construit du comportement neuf dans un produit
qui marche déjà et prouve qu'il atterrit, sans déranger ce qui marchait hier.
refactor prouve que rien d'observable n'a bougé ; celui-ci prouve que la seule
chose voulue a bougé, et rien d'autre.

`/qmw:build-feature <l'intention : ce qui doit atterrir, dans les mots de qui
s'en servira>` énonce ce qui doit atterrir et ce qui ne doit pas bouger, épingle
les surfaces qui doivent survivre au changement (le gate, plus des tests de
caractérisation là où elles n'en ont pas), construit la seule intention, puis la
prouve comme on prouve un fix : le geste joué jusqu'à ce qu'il atterrisse
vraiment (dans un navigateur pour un front, à chaque viewport déclaré), un test
de régression au niveau où vit le comportement, et un regard neuf sur le diff qui
juge à la fois que l'intention atterrit et que rien de ce que le mandat tenait
n'a bougé. Une intention, un commit, une entrée dans `.qmw/build-feature/log.md`.
Un bug trouvé en cours de route est transmis à fix-bug, jamais fondu dans le
commit. Pour les edits de routine, les outils de base ; celui-ci quand un
changement mérite d'être prouvé.

### upgrade-deps - les dépendances montées un pas prouvé à la fois

Travailler sur liste, un poste à la fois, et ne jamais laisser l'arbre dans un
état qui ne partirait pas : à chaque commit il installe, build et passe son gate.
L'alternative habituelle est une branche héroïque qui monte tout d'un coup et
meurt sans être fusionnée.

`/qmw:upgrade-deps` construit la liste de montées depuis chaque manifeste du dépôt,
chiffrée : advisories, majeures, le reste en mineures et patchs. Les advisories
d'abord, les majeures seules (un nom, une montée, un commit, pour qu'une
régression se bissecte vers un seul nom), les familles verrouillées entre elles
montées ensemble, les mineures groupées sous le gate. Chaque montée est lue
avant d'avoir lieu (les vraies release notes, croisées avec l'usage réel dans
le code) et prouvée après : installation propre, build, gate. Ce qui ne monte
pas proprement est annulé et tenu, avec le prix du déblocage écrit dans
`.qmw/upgrade-deps/log.md`, point de départ de la prochaine passe. Chaque commit
laissé derrière est un arbre où installation, build et gate passent.

### run-qa - jouer un vrai utilisateur avant les vrais utilisateurs

Une suite de tests n'exerce jamais qu'un monde propre et fabriqué. Les bugs qui
atteignent les utilisateurs sont surtout ceux qu'une suite en monde propre ne
peut structurellement pas voir : la deuxième fois qu'un geste unique est répété,
le compte à cent lignes au lieu de dix, la garde qui lit le mauvais élément d'une
liste.

`/qmw:run-qa` part d'un environnement réellement vide, avec des personas nés
d'une vraie inscription et de vrais clics, jusqu'à ce que chaque intention du
périmètre aboutisse. Des sous-agents exécutent ; un contrôleur séparé juge chaque
résultat **en praticien expert du métier du persona testé**, pas en visiteur
naïf. Chaque constat atterrit dans un registre vivant, tenu à jour écran par
écran.

Produits front uniquement, pilotés dans un navigateur par arbre d'accessibilité
et locators. La première exécution t'interroge et écrit les réponses dans
`.qmw/run-qa/` à la racine du projet, versionné comme n'importe quelle décision de
projet.

### fix-bug - un bug signalé, de l'incident au fix prouvé

Un fix écrit depuis la seule description du bug corrige la description. Et celui
qui vient de passer une heure sur un fix est la personne la plus mal placée au
monde pour juger s'il a marché.

`/qmw:fix-bug <le signalement>` consigne le rapport mot pour mot avec ses
captures, le reproduit dans un vrai navigateur avant de toucher au code, remonte
à la cause au-delà de la garde qui l'a révélée, corrige la classe et pas
seulement les occurrences, puis prouve le fix comme le bug a été trouvé : le
chemin exact du rapporteur rejoué depuis une session vierge, tenu sur quatre
axes (fonctionnel, visuel, UX, UI à chaque viewport déclaré) et validé par un
regard neuf qui n'a jamais vu le fix. Chaque incident garde ses captures
avant/après, sa cause racine et son test de régression dans `.qmw/fix-bug/`, pour que
le même signalement ne coûte jamais une deuxième enquête.

Le pendant réactif de run-qa, avec la même exigence de preuve, et aucune
dépendance envers lui.

### check-release - la checklist de release, exécutée

La sortie qu'un build fait avant livraison : pas une inspection de plus de
l'arbre de travail, la release réellement construite et poussée comme la
production le fera. Les papiers disent prêt ; l'exécuter tranche.

`/qmw:check-release` construit le commit courant depuis un clone propre (le pas qui
attrape le fichier qui n'existe qu'en local et la dépendance jamais déclarée),
produit et ouvre l'artefact qui partirait, dans les deux sens ; joue les
migrations depuis le dernier état livré plutôt que depuis la base de dev ; juge
le changelog et le saut de version contre le vrai diff depuis le dernier tag ;
et démarre le produit construit comme la production le démarre, jamais le
serveur de dev. Se termine sur un go ou no-go lié à un seul commit : tout
changement de l'arbre annule le verdict et l'essai repart du début. Ne corrige
rien, n'écrit rien ; chaque blocage est une suite que tu demandes après le
verdict.

### audit-agent - ce que l'agent embarque, et ce que ça rapporte

Le manifeste d'un agent, c'est tout ce qu'il embarque à chaque prompt : ce que
chaque élément est, ce qu'il coûte, et pourquoi il est encore installé. Les
autres skills auditent ton code. Celle-ci audite l'agent qui le lit.

`/qmw:audit-agent` inventorie les skills, commandes, sous-agents, hooks, serveurs MCP
et plugins installés, et facture chacun contre ce qu'il a réellement fait. Là où `status` lit le travail que qmw a produit, celle-ci lit l'agent qui l'a
produit. Le coût
permanent se paie à chaque prompt, qu'une skill se déclenche tous les jours ou
jamais ; un hook sur `Bash` tourne à chaque appel shell, avec son timeout comme
pire cas. L'usage se lit dans les transcripts de session plutôt que dans
l'historique des commandes tapées, parce que les skills qui marchent le mieux sont
celles que personne n'a jamais eu besoin de taper. Chaque compte porte la fenêtre
sur laquelle il a été mesuré, et ce qui n'a pas pu être mesuré n'est jamais
retiré sur un silence.

Le constat que personne ne cherche, c'est l'éclipse : deux descriptions qui
revendiquent le même déclencheur ne se partagent pas le travail, l'une gagne et
l'autre ne part jamais, quelle que soit sa qualité. C'est pour ça qu'une bonne
skill a l'air dormante.

`/qmw:audit-agent find <sujet>` cherche ce qui couvre déjà le besoin, déjà installé d'abord,
puis ce que l'écosystème propose - comparés sur l'adéquation, le coût réel (un
plugin installé pour une seule skill embarque toutes les autres, plus ses hooks)
et la confiance, puisqu'une skill est un jeu d'instructions que ton agent va
suivre. Recommande, n'installe jamais. Le troisième verdict est proposé à chaque
fois : écris les trois lignes toi-même.

`/qmw:audit-agent clean` produit le plan de débarquement, un bloc par élément, validé
ligne par ligne. Ce qu'un registre peut réinstaller est supprimé avec sa commande
de restauration ; ce qui n'existe que sur ta machine est archivé, jamais supprimé.
La config est sauvegardée avant qu'on y touche, et un silence ne vaut pas un
accord.

### status - où en est le travail

Le registre de ce qui a été fait, lu quand tu reprends un codebase pour que le
travail continue là où il a été laissé plutôt que d'une page blanche. qmw
écrit à mesure qu'il travaille : les incidents dans `.qmw/fix-bug/`, les
interventions dans `.qmw/refactor/log.md`, les dépendances montées et tenues dans
`.qmw/upgrade-deps/log.md`, un registre vivant dans `.qmw/run-qa/`.

`/qmw:status` lit ces traces et rapporte où en est le travail : les bugs encore
ouverts, les changements atterris et le suivant qu'ils ont nommé, les dépendances
tenues avec le prix du déblocage de chacune, le dernier verdict de release.
Détaille ce qui demande une décision, liste le reste, et clôt sur le pas suivant
que la trace elle-même désigne, rendu comme une invocation. Lit les traces, ne
rejoue jamais les skills ; n'écrit rien.

### full-cycle - tout le cycle de revue, en une passe

Un cycle complet fait passer un codebase par toute la revue en une passe, pas
une réparation. La plupart du temps, une seule skill choisie directement est le
bon outil ; pour tout d'un coup, celle-ci déroule le cycle dans l'ordre.

`/qmw:full-cycle` : audit-codebase, puis un refactor pour chaque constat que tu
retiens, upgrade-deps, un run-qa, et un check-release qui se termine sur un go ou
no-go pour le tag. Orchestre et met des portes ; ne fait pas le travail lui-même,
et ne
saute jamais la porte entre deux étapes, où un silence ne vaut pas un accord. Ne
se lance qu'à la main, comme `/qmw:help` : un orchestrateur n'a rien à dire
tant que tu ne l'as pas tapé.

### Ajouter une skill ici

Un dépôt, un plugin, une release. Une nouvelle skill est un dossier sous
`skills/` dont le nom est ce que les gens taperont après `/qmw:`, un `SKILL.md`
dont le `name` du frontmatter correspond à ce dossier, une mention dans ce
README et dans la carte `/qmw:help`, et une ligne sous Unreleased dans le
changelog. Une skill qui audite déclare `disallowed-tools: Write, Edit,
NotebookEdit`. `node test/repo.mjs` vérifie tout cela, et la CI le lance : une
skill que personne ne peut invoquer, ou un README qui invoque une skill
inexistante, casse le build plutôt que l'installation d'un inconnu.

### Licence

MIT, voir [LICENSE](LICENSE).
