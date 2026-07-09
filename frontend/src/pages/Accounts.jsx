import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Landmark, Wallet } from "lucide-react";
import api from "../lib/axios";
import { API_PATHS } from "../utils/apiPaths";
import Modal from "../components/ui/Modal";
import AccountForm from "../components/AccountForm";
import Spinner from "../components/Spinner";
import { formatCurrency } from "../utils/format";
import { useAuth } from "../context/AuthContext";

const Accounts = () => {
  const { user } = useAuth();
  const currency = user?.currency || "INR";

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAccounts = async () => {
    try {
      const res = await api.get(API_PATHS.ACCOUNTS.LIST);
      setAccounts(res.data);
    } catch {
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (acc) => {
    setEditing(acc);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSaved = () => {
    closeModal();
    fetchAccounts();
  };

  const handleDelete = async (acc) => {
    if (!window.confirm(`Delete "${acc.name}"? This can't be undone.`)) return;

    setDeletingId(acc.id);
    try {
      await api.delete(API_PATHS.ACCOUNTS.DELETE(acc.id));
      toast.success("Account deleted");
      setAccounts((prev) => prev.filter((a) => a.id !== acc.id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeletingId(null);
    }
  };

  const totalBalance = accounts.reduce(
    (sum, a) => sum + Number(a.current_balance),
    0,
  );
  const totalOpening = accounts.reduce(
    (sum, a) => sum + Number(a.opening_balance),
    0,
  );
  const totalNetChange = totalBalance - totalOpening;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400">
            Finance
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Accounts
          </h1>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white text-[12px] font-semibold tracking-[0.08em] uppercase hover:bg-black active:scale-[0.985] transition-all duration-200 shadow-sm shadow-gray-200"
        >
          <Plus size={16} strokeWidth={1.75} />
          Add Account
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-gray-100 rounded-2xl bg-gray-50">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center mb-3">
            <Wallet size={20} strokeWidth={1.75} className="text-gray-600" />
          </div>
          <p className="text-[15px] font-semibold text-gray-900 mb-1">
            No accounts yet
          </p>
          <p className="text-[13px] text-gray-500 mb-4">
            Add a bank, cash, or card account to start tracking balances.
          </p>
          <button
            onClick={openCreate}
            className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-700 hover:text-gray-900 transition-colors"
          >
            Add your first account →
          </button>
        </div>
      ) : (
        <>
          {/* Grand total across all accounts */}
          <div className="p-5 sm:p-7 rounded-2xl border border-gray-100 bg-gray-900 text-white">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-2">
              Total Across All Accounts
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight">
                {formatCurrency(totalBalance, currency)}
              </span>
              <span
                className={`text-[13px] font-semibold ${
                  totalNetChange >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {totalNetChange >= 0 ? "+" : ""}
                {formatCurrency(totalNetChange, currency)} from transactions
              </span>
            </div>
            <p className="text-[12px] text-gray-400 mt-1">
              Started with {formatCurrency(totalOpening, currency)} in opening
              balances across {accounts.length} account
              {accounts.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Per-account breakdown */}
          <div className="grid gap-4">
            {accounts.map((acc) => {
              const opening = Number(acc.opening_balance);
              const current = Number(acc.current_balance);
              const netChange = current - opening;

              return (
                <div
                  key={acc.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <Landmark
                          size={20}
                          strokeWidth={1.75}
                          className="text-gray-700"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {acc.name}
                        </h3>
                        <p className="text-sm text-gray-500">{acc.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-8 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Current Balance</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(current, currency)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(acc)}
                          className="text-gray-500 hover:text-black transition-colors"
                          aria-label={`Edit ${acc.name}`}
                        >
                          <Pencil size={18} strokeWidth={1.75} />
                        </button>

                        <button
                          onClick={() => handleDelete(acc)}
                          disabled={deletingId === acc.id}
                          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Delete ${acc.name}`}
                        >
                          <Trash2 size={18} strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Opening → Transactions → Current breakdown */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-1">
                        Opening Balance
                      </p>
                      <p className="text-[14px] font-bold text-gray-900">
                        {formatCurrency(opening, currency)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-1">
                        From Transactions
                      </p>
                      <p
                        className={`text-[14px] font-bold ${
                          netChange >= 0 ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {netChange >= 0 ? "+" : ""}
                        {formatCurrency(netChange, currency)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-1">
                        Current Balance
                      </p>
                      <p className="text-[14px] font-bold text-gray-900">
                        {formatCurrency(current, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Edit Account" : "New Account"}
      >
        <AccountForm
          initial={editing}
          existingAccounts={accounts}
          onSaved={handleSaved}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default Accounts;
