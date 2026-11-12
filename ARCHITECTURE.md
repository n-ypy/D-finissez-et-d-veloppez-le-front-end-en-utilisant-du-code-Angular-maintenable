# Architecture

Application Angular 22 de TéléSport : un tableau de bord des médailles par pays et une page de détail par pays. Les données sont simulées par un fichier JSON.

## Vue d'ensemble

```text
assets/mock/olympic.json (plus tard : API REST)
        │  HTTP
        ▼
   DataService                        seul accès aux données
        │  Observable
        ▼
DashboardPage / CountryDetailPage     préparent les données d'une page
        │  @Input
        ▼
Header / PieChart / LineChart         affichent
```

Les données descendent du service vers les composants. Dans l'autre sens, un clic sur une part du camembert remonte l'id du pays par un `@Output` jusqu'à `DashboardPage`, qui navigue vers `/country/:id`.

## Arborescence

```text
src/app/
├── app.component.*     racine de l'application, affiche la page de la route active
├── app.config.ts       configuration du routeur et de HttpClient
├── app.constants.ts    URL des données, couleurs des graphiques
├── app.routes.ts       liste des routes
├── components/         affichage réutilisable
│   ├── header/
│   ├── line-chart/
│   ├── pie-chart/
│   └── status-message/
├── models/             interfaces TypeScript
│   ├── indicator.model.ts
│   ├── load-state.model.ts
│   ├── olympic.model.ts
│   ├── participation.model.ts
│   └── pie-slice.model.ts
├── pages/              composants liés à une route
│   ├── country-detail/
│   ├── dashboard/
│   └── not-found/
├── services/
│   └── data.service.ts
└── utils/
    └── with-load-state.ts  opérateur RxJS des états d'affichage
```

Les composants sont standalone : chacun déclare ce qu'il utilise dans ses `imports`, sans `NgModule`.

## Composants et rôles

| Composant | Dossier | Rôle |
| --- | --- | --- |
| `DashboardPage` | `pages/dashboard/` | Page d'accueil : indicateurs et camembert. Ouvre la page du pays cliqué. |
| `CountryDetailPage` | `pages/country-detail/` | Page d'un pays : indicateurs, courbe et lien de retour. Redirige vers `/not-found` si le pays n'existe pas. |
| `NotFoundComponent` | `pages/not-found/` | Page affichée pour une route inconnue ou un pays inexistant, avec un bouton vers le tableau de bord. |
| `HeaderComponent` | `components/header/` | Affiche un titre et une liste d'indicateurs reçus en `@Input`. |
| `PieChartComponent` | `components/pie-chart/` | Dessine un camembert. Reçoit des `slices` (id, libellé, valeur) et renvoie l'id de la part cliquée par `sliceClick`. |
| `LineChartComponent` | `components/line-chart/` | Dessine une courbe. Reçoit `labels`, `values` et l'unité des valeurs (`unit`). |
| `StatusMessageComponent` | `components/status-message/` | Remplace le contenu pendant le chargement, si les données sont vides ou en cas d'erreur. Les boutons d'action sont fournis par la page (`ng-content`). |

Les pages sont des conteneurs : elles récupèrent les données et les préparent. Les composants de `components/` ne connaissent ni le service, ni le routeur, et restent donc réutilisables.

Chaque composant de graphique crée son instance Chart.js dans `ngAfterViewInit`, la recrée si ses données changent (`ngOnChanges`) et la détruit dans `ngOnDestroy`. La taille vient du CSS du composant (`aspect-ratio`).

## Le service `DataService`

`DataService` est le seul point d'accès aux données. Il est déclaré en `providedIn: 'root'`, donc toute l'application partage la même instance (pattern Singleton).

| Méthode | Renvoie | Rôle |
| --- | --- | --- |
| `getOlympics()` | `Observable<Olympic[]>` | Tous les pays |
| `getOlympicById(id)` | `Observable<Olympic \| undefined>` | Un pays, ou `undefined` s'il n'existe pas |
| `getTotalMedals(olympic)` | `number` | Total des médailles d'un pays |
| `getTotalAthletes(olympic)` | `number` | Total des athlètes d'un pays |
| `countEditions(olympics)` | `number` | Nombre de JO distincts |

Le fichier JSON n'est lu qu'une fois grâce à `shareReplay(1)`. Si la lecture échoue, rien n'est gardé en mémoire et l'accès suivant réessaie.

**Utilisation dans une page :** le service est injecté par le constructeur, et le template lit le résultat avec le pipe `async`, qui gère l'abonnement et le désabonnement.

```ts
constructor(private readonly dataService: DataService) {
  this.state$ = this.dataService.getOlympics().pipe(
    map((olympics) => this.toView(olympics)),
    withLoadState(),
  );
}
```

```html
@if (state$ | async; as state) {
  @if (state.status === 'ready') {
    <app-header title="Medals per Country" [indicators]="state.data.indicators" />
  } @else {
    <app-status-message [type]="state.status" />
  }
}
```

Sur la page de détail, ce flux part de la route (`paramMap`) : quand le pays change dans l'URL, les données et l'affichage suivent.

## Routes

| Route | Page |
| --- | --- |
| `/` | `DashboardPage` |
| `/country/:id` | `CountryDetailPage` |
| `/not-found` et toute route inconnue | `NotFoundComponent` |

Chaque nouvelle page s'ouvre en haut, et le bouton « Précédent » du navigateur retrouve la position de défilement d'avant (`withInMemoryScrolling`).

## États d'affichage et erreurs

Chaque page passe son flux de données dans l'opérateur `withLoadState()` : le flux émet `loading`, puis `ready` avec les données, ou `error` si la requête échoue ou si les données sont mal formées. Le template choisit quoi afficher selon `status`, et l'utilisateur ne voit jamais d'écran vide ni de message technique.

| Situation | Affichage |
| --- | --- |
| Chargement | Spinner et « Loading data… » |
| Échec de la requête, JSON invalide, données mal formées | « We couldn't load the data. Please try again later. » Tableau de bord : bouton « Try again ». Page détail : bouton « Back », toujours affiché. |
| Aucun pays, ou pays sans participation | L'en-tête, puis « No data available. » à la place du graphique |
| Pays inexistant (`/country/999`, `/country/abc`) | Redirection vers `/not-found`, sans garder l'URL fausse dans l'historique |
| Route inconnue | `NotFoundComponent` |

Sur la page de détail, l'erreur est traitée à l'intérieur du `switchMap` : après une erreur, un changement de pays dans l'URL relance le chargement.

**Simuler une erreur :** dans les DevTools, onglet *Network*, clic droit sur `olympic.json` puis *Block request URL* (échec de la requête), ou *Throttling* sur *Slow 3G* (chargement).

## Préparation au back-end

Les pages et les composants ne savent pas d'où viennent les données :

- **Si l'API renvoie le même format :** il suffit de remplacer `OLYMPICS_URL` dans `app.constants.ts`.
- **Si le format est différent :** la conversion se fait dans `DataService`, et les interfaces de `models/` restent le contrat pour le reste de l'application.
- **Si l'API propose une route par pays :** `getOlympicById` peut l'appeler sans changer sa signature, donc sans toucher aux pages.
- **Si les données changent souvent :** le cache de `shareReplay(1)` sera à revoir, car il garde la première réponse jusqu'au rechargement de la page.

## Tests

`npm test` lance les tests Vitest. Ils couvrent `DataService` (calculs, cache, nouvel essai après une erreur), l'opérateur `withLoadState`, `StatusMessageComponent` et les états des pages : chargement, erreur, données vides, pays inexistant.

Le dessin des graphiques ne se teste pas ainsi, car jsdom n'a pas de canvas : il se vérifie dans le navigateur avec `ng serve`.

## Ajouter une page

1. Créer le composant dans `pages/` et l'ajouter à `app.routes.ts`.
2. Récupérer les données par `DataService`, sans appel HTTP dans le composant.
3. Réutiliser `HeaderComponent` et, si besoin, les composants de graphique.
