# Programrendszerek fejlesztése projektmunka

Választott témakör: Egészségügyi adatkezelő

A rendszer a MEAN (MongoDB, ExpressJS, Angular 2+, NodeJS) technológiai stack-ben valósult meg TypeScript alapon.

## Telepítés, futtatás:

A program futtatásához szükséges a Node.js: https://nodejs.org/en/download

A repo klónozása után kettő terminálra lesz szükség.

Az elsőben navigálj el a "server" mappába és a következő utasításokat hajtsd végre:
```
npm install
npx ts-node src/seeder.ts
npx ts-node src/app.ts
```
Az első utasítás a szerveroldali függőségeket telepíti,
a második rácsatlakozik az adatbázisra, kiüríti, feltölti azt demó adatokkal és végezetül megszakítja a kapcsolatot,
a harmadik pedig ismét rácsatlakozik az adatbázisra és elindítja a szervert.

A másik terminálban a "client" mappába navigálás után pedig ezeket hajtsd végre:
```
npm install
ng serve
```
Az első utasítás a kliensoldali függőségeket telepíti, a második pedig helyben felépíti és kiszolgálja az alkalmazást.

A \server\src-ben található seeder.ts-ben lévő demó páciensek és orvosok adatait felhasználhatod a kipróbálás során.
