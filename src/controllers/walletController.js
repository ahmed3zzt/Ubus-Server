// import { getWallet, upsertWallet, addCoinTransaction } from '../models/walletModel.js';

// export async function getBalance(req, res, next) {
//   try {
//     const userId = req.user.id;
//     const wallet = await getWallet(userId);
//     return res.json({ balance_coins: wallet.balance_coins });
//   } catch (err) {
//     return next(err);
//   }
// }

// export async function topup(req, res, next) {
//   try {
//     const userId = req.user.id;
//     const { amount } = req.body;
//     if (!Number.isFinite(amount) || amount <= 0) {
//       return res.status(400).json({ error: 'Invalid amount' });
//     }
//     const current = await getWallet(userId);
//     const updated = await upsertWallet(userId, (current.balance_coins ?? 0) + amount);
//     await addCoinTransaction({ user_id: userId, amount_coins: amount, type: 'topup', meta: null });
//     return res.json({ balance_coins: updated.balance_coins });
//   } catch (err) {
//     return next(err);
//   }
// }


