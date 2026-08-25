# quietmachineworks

[English](#english) | [Français](#français)

## English

Small, opinionated tools for solo developers shipping real projects. One plugin,
one install, eight skills.

```
/plugin marketplace add quietmachineworks/qmw
/plugin install qmw@quietmachineworks
```

Or with the skills CLI, for any agent that reads `SKILL.md`:

```bash
npx skills add quietmachineworks/qmw
```

### ratchet - make a rule enforce itself

A rule written in `CLAUDE.md`, `AGENTS.md` or a style guide is an intention.
Nothing applies it. Banning the pattern outright does not work either: on a
repository that already breaks the rule, every existing case would have to be
fixed before the check can go on, so it never goes on. A ratchet freezes what the
repository already carries, fails when that number rises, and lets it fall.

```
/qmw:ratchet-audit
```

Reads what your project already states, and sorts every rule into three piles:
already covered by a linter, mechanizable but unenforced with the count it
currently reaches, and judgment calls no check should approximate. Writes
nothing. The middle pile is usually much larger than expected.

```
/qmw:ratchet-add no TODO comments in application code
```

Builds the check for one rule, freezes today's count as the baseline, and wires
it into CI.

### survey - the whole codebase, hull to rigging

A survey is what a vessel gets before someone buys or insures it: the whole boat
inspected, and a defect list ordered by what sinks her first. The surveyor
repairs nothing; the owner decides what gets fixed and what they can live with.

```
/qmw:survey
```

Audits the entire codebase, or just the perimeters you pick (front, back,
mobile, infra), under nine lenses: design, duplication and reinvention,
over-engineering, superseded patterns, dead weight, inconsistency, boundary
hygiene, performance shapes, test debt. Everything is judged against the stack
the project actually runs, never against last month's release, and never
against your own written conventions, which outrank generic best practice.
Reports and prioritizes, fixes nothing, writes nothing: every repair is a
follow-up you ask for after reading it.

### refit - one repair, nothing else moves

The yard work that follows the survey. The surveyor hands over a defect list;
the yard takes one item, does the work, and the boat leaves able to do
everything she could do when she arrived. A repair that changes how she sails
has failed, however clean the welds.

```
/qmw:refit <a finding from the survey, or a defect class named directly>
```

Re-verifies the finding against the tree as it stands, enumerates every carrier
of the class, pins current behavior before anything moves (the project's gate,
plus characterization tests where the touched code has none), then closes the
class rather than patching the sites. Proof that nothing observable changed:
the pin replayed, the finding's count re-measured to zero, touched screens
walked in a browser, and a fresh-eyed sub-agent judging the diff against the
mandate alone. One intervention, one commit, one entry in `.refit/log.md`. A
bug discovered mid-repair is handed off, never silently corrected inside a
restructuring commit.

### drydock - dependencies raised one proven step at a time

A dry dock works from a list, one item at a time, and never launches a boat
mid-repair: at every point the vessel in the dock is one that could float. The
usual alternative is one heroic upgrade-everything branch that dies unmerged.

```
/qmw:drydock
```

Builds the yard list from every manifest the repository carries, priced:
advisories, majors, the minor-and-patch remainder. Advisories first, majors
alone (one name, one raise, one commit, so a regression bisects to one name),
version-locked families moved together, minors batched under the gate. Each
raise is read before it happens - the real release notes, intersected with
actual usage in the code - and proven after: clean install, build, gate. What
cannot be raised cleanly is reverted and held, with the price of unblocking it
written into `.drydock/log.md`, which is the next drydock's starting point.
Every commit left behind is a tree where install, build and gate pass.

### shakedown - play a real user before real users do

Test suites only ever exercise clean, fabricated worlds. The bugs that reach real
users are disproportionately the ones a clean-world suite structurally cannot
see: the second time a unique gesture is repeated, the account with a hundred
rows instead of ten, the guard that reads the wrong element of a list.

```
/qmw:shakedown
```

A genuinely empty environment, personas born from real signup, real clicks, until
every intention in scope actually lands. Sub-agents execute; a separate
controller judges each result as an expert practitioner of the tested persona's
real job, not as a generic first-time user. Every finding lands in a living
registry, kept up to date screen by screen.

Front-end products only, driven through a browser by accessibility tree and
locators. The first run interviews you and writes the answers into `.shakedown/`
at the project root, versioned like any other project decision.

### squawk - one reported bug, from incident to proven fix

A fix written from the bug's description alone fixes the description. And
whoever just spent an hour on a fix is the worst-placed person alive to judge
whether it worked.

```
/qmw:squawk a user says they paid and the invoice still shows unpaid
```

Logs the report verbatim with its screenshots, reproduces it in a real browser
before touching any code, chases the cause past the guard that revealed it,
fixes the class rather than the sites, then proves the fix the way the bug was
found: the reporter's exact path replayed from a clean session, held to four
axes - functional, visual, UX, UI at every declared viewport - and signed off by
fresh eyes that never saw the fix. Every incident keeps its before/after
captures, root cause and regression test in `.squawk/`, so the same report never
costs a second investigation.

The reactive counterpart to shakedown, with the same standard of proof - and no
dependency on it.

### seatrial - the release checklist, executed

Sea trials are the run a vessel makes before delivery: not one more inspection
at the dock, the boat actually taken out and run. The dock paperwork says
ready; the trial finds out.

```
/qmw:seatrial
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

### Adding a skill here

One repository, one plugin, one release. A new skill is a folder under `skills/`
whose name is what people will type after `/qmw:`, a `SKILL.md` whose frontmatter
`name` matches that folder, and a mention in this README. CI enforces all three:
a skill nobody can invoke, or a README that invokes one that does not exist,
fails the build rather than a stranger's install.

### License

MIT, see [LICENSE](LICENSE).

---

## Français

Des outils courts et assumés, pour les développeurs seuls qui livrent de vrais
projets. Un plugin, une installation, huit skills.

```
/plugin marketplace add quietmachineworks/qmw
/plugin install qmw@quietmachineworks
```

### ratchet - qu'une règle s'applique d'elle-même

Une règle écrite dans `CLAUDE.md`, `AGENTS.md` ou un guide de style est une
intention. Rien ne l'applique. Interdire le motif d'un coup ne marche pas non
plus : sur un dépôt qui enfreint déjà la règle, il faudrait corriger tous les cas
existants avant de pouvoir activer le contrôle, donc il n'est jamais activé. Un
cliquet gèle ce que le dépôt porte déjà, échoue quand ce nombre monte, et le
laisse descendre.

`/qmw:ratchet-audit` lit ce que ton projet énonce déjà et trie chaque règle en
trois tas : déjà couverte par un linter, mécanisable mais non appliquée avec le
compte qu'elle atteint aujourd'hui, et jugement qu'aucun contrôle ne doit
approximer. N'écrit rien. Le tas du milieu est presque toujours plus gros que
prévu.

`/qmw:ratchet-add <la règle>` construit le contrôle, gèle le compte du jour comme
référence, et le branche dans la CI.

### survey - tout le code, de la coque au gréement

Une expertise maritime, c'est ce que subit un bateau avant l'achat : le
navire entier inspecté, et une liste de défauts triée par ce qui le coule en
premier. L'expert ne répare rien ; le propriétaire décide ce qui se corrige et
ce avec quoi il peut vivre.

`/qmw:survey` audite la totalité du code, ou seulement les périmètres choisis
(front, back, mobile, infra), sous neuf angles : conception, duplication et
réinvention, sur-ingénierie, patterns dépassés, code mort, incohérences,
hygiène des frontières, formes de performance, dette de tests. Tout est jugé
contre la stack que le projet fait réellement tourner, jamais contre la
release du mois dernier, et jamais contre tes propres conventions écrites, qui
priment sur les bonnes pratiques génériques. Rapporte et priorise, ne corrige
rien, n'écrit rien : chaque réparation est une suite que tu demandes après
lecture.

### refit - une réparation, rien d'autre ne bouge

Le chantier qui suit l'expertise. L'expert remet une liste de défauts ; le
chantier prend un poste à la fois, fait le travail, et le bateau repart capable
de tout ce qu'il savait faire en arrivant. Une réparation qui change sa façon
de naviguer a échoué, aussi propres que soient les soudures.

`/qmw:refit <un constat du rapport, ou une classe de défaut nommée>` revérifie
le constat contre l'arbre tel qu'il est, énumère tous les porteurs de la
classe, épingle le comportement courant avant de bouger quoi que ce soit (le
gate du projet, plus des tests de caractérisation là où le code touché n'en a
pas), puis ferme la classe au lieu de rapiécer les occurrences. Preuve que rien
d'observable n'a bougé : l'épingle rejouée, le compte du constat remesuré à
zéro, les écrans touchés parcourus dans un navigateur, et un sous-agent au
regard neuf qui juge le diff contre le seul mandat. Une intervention, un
commit, une entrée dans `.refit/log.md`. Un bug découvert en cours de
réparation est transmis, jamais corrigé en silence dans un commit de
restructuration.

### drydock - les dépendances montées un pas prouvé à la fois

Une cale sèche travaille sur liste, un poste à la fois, et ne remet jamais à
l'eau un bateau en cours de réparation : à tout instant, le navire dans la cale
est un navire qui flotterait. L'alternative habituelle est une branche héroïque
qui monte tout d'un coup et meurt sans être fusionnée.

`/qmw:drydock` construit la liste de chantier depuis chaque manifeste du dépôt,
chiffrée : advisories, majeures, le reste en mineures et patchs. Les advisories
d'abord, les majeures seules (un nom, une montée, un commit, pour qu'une
régression se bissecte vers un seul nom), les familles verrouillées entre elles
montées ensemble, les mineures groupées sous le gate. Chaque montée est lue
avant d'avoir lieu (les vraies release notes, croisées avec l'usage réel dans
le code) et prouvée après : installation propre, build, gate. Ce qui ne monte
pas proprement est annulé et tenu, avec le prix du déblocage écrit dans
`.drydock/log.md`, point de départ de la prochaine cale sèche. Chaque commit
laissé derrière est un arbre où installation, build et gate passent.

### shakedown - jouer un vrai utilisateur avant les vrais utilisateurs

Une suite de tests n'exerce jamais qu'un monde propre et fabriqué. Les bugs qui
atteignent les utilisateurs sont surtout ceux qu'une suite en monde propre ne
peut structurellement pas voir : la deuxième fois qu'un geste unique est répété,
le compte à cent lignes au lieu de dix, la garde qui lit le mauvais élément d'une
liste.

`/qmw:shakedown` part d'un environnement réellement vide, avec des personas nés
d'une vraie inscription et de vrais clics, jusqu'à ce que chaque intention du
périmètre aboutisse. Des sous-agents exécutent ; un contrôleur séparé juge chaque
résultat **en praticien expert du métier du persona testé**, pas en visiteur
naïf. Chaque constat atterrit dans un registre vivant, tenu à jour écran par
écran.

Produits front uniquement, pilotés dans un navigateur par arbre d'accessibilité
et locators. La première exécution t'interroge et écrit les réponses dans
`.shakedown/` à la racine du projet, versionné comme n'importe quelle décision de
projet.

### squawk - un bug signalé, de l'incident au fix prouvé

Un fix écrit depuis la seule description du bug corrige la description. Et celui
qui vient de passer une heure sur un fix est la personne la plus mal placée au
monde pour juger s'il a marché.

`/qmw:squawk <le signalement>` consigne le rapport mot pour mot avec ses
captures, le reproduit dans un vrai navigateur avant de toucher au code, remonte
à la cause au-delà de la garde qui l'a révélée, corrige la classe et pas
seulement les occurrences, puis prouve le fix comme le bug a été trouvé : le
chemin exact du rapporteur rejoué depuis une session vierge, tenu sur quatre
axes (fonctionnel, visuel, UX, UI à chaque viewport déclaré) et validé par un
regard neuf qui n'a jamais vu le fix. Chaque incident garde ses captures
avant/après, sa cause racine et son test de régression dans `.squawk/`, pour que
le même signalement ne coûte jamais une deuxième enquête.

Le pendant réactif de shakedown, avec la même exigence de preuve, et aucune
dépendance envers lui.

### seatrial - la checklist de release, exécutée

Les essais en mer sont la sortie qu'un navire fait avant livraison : pas une
inspection de plus à quai, le bateau réellement sorti et poussé. Les papiers du
quai disent prêt ; l'essai tranche.

`/qmw:seatrial` construit le commit courant depuis un clone propre (le pas qui
attrape le fichier qui n'existe qu'en local et la dépendance jamais déclarée),
produit et ouvre l'artefact qui partirait, dans les deux sens ; joue les
migrations depuis le dernier état livré plutôt que depuis la base de dev ; juge
le changelog et le saut de version contre le vrai diff depuis le dernier tag ;
et démarre le produit construit comme la production le démarre, jamais le
serveur de dev. Se termine sur un go ou no-go lié à un seul commit : tout
changement de l'arbre annule le verdict et l'essai repart du début. Ne corrige
rien, n'écrit rien ; chaque blocage est une suite que tu demandes après le
verdict.

### Ajouter une skill ici

Un dépôt, un plugin, une release. Une nouvelle skill est un dossier sous
`skills/` dont le nom est ce que les gens taperont après `/qmw:`, un `SKILL.md`
dont le `name` du frontmatter correspond à ce dossier, et une mention dans ce
README. La CI vérifie les trois : une skill que personne ne peut invoquer, ou un
README qui invoque une skill inexistante, casse le build plutôt que
l'installation d'un inconnu.

### Licence

MIT, voir [LICENSE](LICENSE).
