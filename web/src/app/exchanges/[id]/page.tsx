'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';
import { getMediaUrl, getStatusColor } from '@/lib/utils';
import { Exchange, User, Message } from '@/lib/types';
import ExchangeChat from '@/components/exchanges/ExchangeChat';
import ExchangeShipping from '@/components/exchanges/ExchangeShipping';
import ExchangeRating from '@/components/exchanges/ExchangeRating';
import ExchangeContact from '@/components/exchanges/ExchangeContact';
import Link from 'next/link';

export default function ExchangeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chat state held here to support polling/initial load
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!exchange || !['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(exchange.status)) return;
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [exchange?.status]);

  const loadData = async () => {
    try {
      const [profile, exData] = await Promise.all([
        api.users.getProfile(),
        api.exchanges.get(id as string),
      ]);
      setCurrentUser(profile);
      setExchange(exData);
      if (exData.messages) setMessages(exData.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await api.messages.listByExchange(id as string);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    }
  };

  const statusLabel = (status: string) => {
    const key = `status_${status}` as any;
    return t(key) || status;
  };

  const handleStatusUpdate = async (status: string) => {
    setActionLoading(status);
    setError(null);
    try {
      await api.exchanges.updateStatus(id as string, status);
      if (status === 'REJECTED') {
        router.push('/profile?tab=exchanges');
      } else {
        await loadData();
      }
    } catch (e: any) {
      console.error('Exchange update failed:', e);
      setError(e?.message || t('exDetail_actionError'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    setActionLoading('CANCEL');
    setError(null);
    try {
      await api.exchanges.cancel(id as string);
      router.push('/profile?tab=exchanges');
    } catch (e: any) {
      console.error('Exchange cancel failed:', e);
      setError(e?.message || t('exDetail_cancelError'));
      setActionLoading(null);
    }
  };

  // Chat handlers PASSED to component
  const handleSendMessage = async (content: string) => {
    const msg = await api.messages.send(id as string, content);
    setMessages((prev) => [...prev, msg]);
  };

  const handleEditMessage = async (msgId: string, content: string) => {
    const updated = await api.messages.update(msgId, content);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, content: updated.content, updatedAt: updated.updatedAt } : m,
      ),
    );
  };

  const handleDeleteMessage = async (msgId: string) => {
    await api.messages.delete(msgId);
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  // Shipping handlers PASSED to component
  const handleSaveShipping = async (data: any) => {
    await api.exchanges.updateShipping(id as string, data);
    await loadData();
  };

  const handleConfirmShipping = async () => {
    await api.exchanges.confirmShipping(id as string);
    await loadData();
  };

  // Rating handler PASSED to component
  const handleRate = async (score: number, comment: string) => {
    await api.exchanges.createRating(id as string, { score, comment });
    await loadData();
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      </>
    );
  if (!exchange)
    return (
      <>
        <Navbar />
        <div className="p-8 text-center">{t('exDetail_notFound')}</div>
      </>
    );

  const isIncoming = exchange.receiverId === currentUser?.id;
  const otherUser = isIncoming ? exchange.initiator : exchange.receiver;
  const myItem = isIncoming ? exchange.itemRequested : exchange.itemOffered;
  const theirItem = isIncoming ? exchange.itemOffered : exchange.itemRequested;
  const isActive = ['ACCEPTED', 'IN_PROGRESS'].includes(exchange.status);
  const showChat = ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(exchange.status);

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 pb-12">
        {/* Back Link */}
        <Link
          href="/profile?tab=exchanges"
          className="inline-flex items-center text-gray-500 hover:text-gray-700 font-medium mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {t('exchanges_title') || 'Обмены'}
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('exDetail_title')}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exchange.status)}`}
          >
            {statusLabel(exchange.status)}
          </span>
        </div>

        {/* Items Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Their Item */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {isIncoming ? t('exDetail_theyOffer') : t('exDetail_youRequested')}
            </h2>
            <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden">
              {theirItem?.photos?.[0] ? (
                <img
                  src={getMediaUrl(theirItem.photos[0].url)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🧸</div>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{theirItem?.title}</h3>
            <p className="text-gray-500 text-sm mb-4">{theirItem?.description}</p>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xs">
                {otherUser?.name?.[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{otherUser?.name}</p>
                <p className="text-xs text-gray-500">{t('exDetail_owner')}</p>
              </div>
            </div>
          </div>

          {/* My Item */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {isIncoming ? t('exDetail_yourItem') : t('exDetail_youOffered')}
            </h2>
            <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden">
              {myItem?.photos?.[0] ? (
                <img
                  src={getMediaUrl(myItem.photos[0].url)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🧸</div>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{myItem?.title}</h3>
            <p className="text-gray-500 text-sm mb-4">{myItem?.description}</p>
            {isIncoming && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                  {t('you')}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('you')}</p>
                  <p className="text-xs text-gray-500">{t('exDetail_owner')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 mb-8">
          {isIncoming && exchange.status === 'PROPOSED' && (
            <>
              <button
                onClick={() => handleStatusUpdate('REJECTED')}
                disabled={actionLoading !== null}
                className="px-6 py-2.5 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === 'REJECTED' && (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                )}
                {t('exDetail_reject')}
              </button>
              <button
                onClick={() => handleStatusUpdate('ACCEPTED')}
                disabled={actionLoading !== null}
                className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === 'ACCEPTED' && (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                )}
                {t('exDetail_acceptExchange')}
              </button>
            </>
          )}

          {!isIncoming && exchange.status === 'PROPOSED' && (
            <button
              onClick={handleCancel}
              disabled={actionLoading !== null}
              className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {actionLoading === 'CANCEL' && (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
              )}
              {t('exDetail_cancelRequest')}
            </button>
          )}

          {exchange.status === 'ACCEPTED' && (
            <div className="px-6 py-2.5 rounded-xl bg-green-50 text-green-700 font-medium">
              {t('exDetail_confirmed')}
            </div>
          )}

          {exchange.status === 'IN_PROGRESS' &&
            (() => {
              const isInitiator = exchange.initiatorId === currentUser?.id;
              const myConfirmed = isInitiator
                ? exchange.initiatorCompleted
                : exchange.receiverCompleted;
              const otherConfirmed = isInitiator
                ? exchange.receiverCompleted
                : exchange.initiatorCompleted;
              const myShippingOk = isInitiator
                ? exchange.initiatorShippingConfirmed
                : exchange.receiverShippingConfirmed;
              const otherShippingOk = isInitiator
                ? exchange.receiverShippingConfirmed
                : exchange.initiatorShippingConfirmed;
              const bothShippingConfirmed = myShippingOk && otherShippingOk;

              return (
                <div className="w-full">
                  <div className="px-6 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-medium mb-4">
                    {t('exDetail_inProgress')}
                  </div>
                  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      {t('exDetail_completionConfirm')}
                    </p>

                    {/* Shipping confirmation status */}
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${myShippingOk ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {myShippingOk ? '📦' : '·'}
                        </span>
                        <span
                          className={myShippingOk ? 'text-blue-700 font-medium' : 'text-gray-500'}
                        >
                          {t('you')}:{' '}
                          {myShippingOk ? t('shipping_confirmed') : t('shipping_needConfirm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${otherShippingOk ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {otherShippingOk ? '📦' : '·'}
                        </span>
                        <span
                          className={
                            otherShippingOk ? 'text-blue-700 font-medium' : 'text-gray-500'
                          }
                        >
                          {otherUser?.name || t('exDetail_participant')}:{' '}
                          {otherShippingOk ? t('shipping_confirmed') : t('shipping_needConfirm')}
                        </span>
                      </div>
                    </div>

                    {!bothShippingConfirmed && (
                      <div className="mb-4 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                        ⚠️ {t('shipping_bothRequired')}
                      </div>
                    )}

                    {/* Completion confirmation */}
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${myConfirmed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {myConfirmed ? '✓' : '·'}
                        </span>
                        <span
                          className={myConfirmed ? 'text-emerald-700 font-medium' : 'text-gray-500'}
                        >
                          {t('you')}{' '}
                          {myConfirmed ? t('exDetail_youConfirmed') : t('exDetail_youNotConfirmed')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${otherConfirmed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {otherConfirmed ? '✓' : '·'}
                        </span>
                        <span
                          className={
                            otherConfirmed ? 'text-emerald-700 font-medium' : 'text-gray-500'
                          }
                        >
                          {otherUser?.name || t('exDetail_participant')}{' '}
                          {otherConfirmed
                            ? t('exDetail_otherConfirmed')
                            : t('exDetail_otherNotConfirmed')}
                        </span>
                      </div>
                    </div>
                    {!myConfirmed ? (
                      <button
                        onClick={() => handleStatusUpdate('COMPLETED')}
                        disabled={actionLoading !== null || !bothShippingConfirmed}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {actionLoading === 'COMPLETED' && (
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        )}
                        {t('exDetail_confirmComplete')}
                      </button>
                    ) : (
                      <div className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium inline-flex items-center gap-2">
                        {t('exDetail_awaitingOther')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          {exchange.status === 'COMPLETED' && (
            <div className="px-6 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-medium">
              {t('exDetail_completed')}
            </div>
          )}

          {exchange.status === 'REJECTED' && (
            <div className="px-6 py-2.5 rounded-xl bg-red-50 text-red-700 font-medium">
              {t('exDetail_rejected')}
            </div>
          )}
        </div>

        {/* ═══ Rating Section (completed exchanges) ═══ */}
        {exchange.status === 'COMPLETED' && (
          <ExchangeRating
            myRating={exchange.ratings?.find((r: any) => r.fromUserId === currentUser?.id)}
            otherRating={exchange.ratings?.find((r: any) => r.fromUserId !== currentUser?.id)}
            onSubmit={handleRate}
          />
        )}

        {/* ═══ Contact Info (shown after ACCEPTED) ═══ */}
        {isActive && otherUser && <ExchangeContact user={otherUser} />}

        {/* ═══ Shipping Stage ═══ */}
        {isActive && (
          <ExchangeShipping
            exchange={exchange}
            currentUser={currentUser}
            onSave={handleSaveShipping}
            onConfirm={handleConfirmShipping}
          />
        )}

        {/* ═══ Chat Section ═══ */}
        {showChat && (
          <ExchangeChat
            exchangeId={id as string}
            exchangeStatus={exchange.status}
            messages={messages}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        )}
      </div>
    </>
  );
}
