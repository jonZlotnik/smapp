// @flow
import { Auth, Main, LocalNode, Wallet, Overview, SendCoins, Backup, Transactions } from '/screens';

const app = [
  {
    path: '/auth',
    component: Auth
  },
  {
    path: '/main',
    component: Main
  }
];

const main = [
  {
    path: '/main/wallet',
    component: Wallet
  },
  {
    path: '/main/local-node',
    component: LocalNode
  },
  {
    path: '/main/transactions',
    component: Transactions
  }
];

const wallet = [
  {
    path: '/main/wallet/overview',
    component: Overview
  },
  {
    path: '/main/wallet/sendCoins',
    component: SendCoins
  },
  {
    path: '/main/wallet/backup',
    component: Backup
  }
];

const routes = {
  app,
  main,
  wallet
};

export default routes;
