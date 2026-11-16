import { dbStore } from './store';
import { UserProfile, UserRole } from '@library/shared';
import { supabase } from '../config/supabase';

const safeSync = (fn: () => PromiseLike<any>) => {
  try {
    Promise.resolve(fn()).catch((e) => {
      console.warn('[Supabase API Sync]:', e?.message || e);
    });
  } catch (err) {
    console.warn('[Supabase API Sync exception]:', err);
  }
};

export class MemberService {
  public getAllMembers(role?: UserRole, search?: string) {
    let list = [...dbStore.profiles];

    if (role) {
      list = list.filter(p => p.role === role);
    }

    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        (p.rollNumber && p.rollNumber.toLowerCase().includes(term)) ||
        (p.staffId && p.staffId.toLowerCase().includes(term))
      );
    }

    return list;
  }

  public getMemberById(id: string) {
    const member = dbStore.profiles.find(p => p.id === id);
    if (!member) return null;

    const borrowings = dbStore.transactions.filter(t => t.userId === id).map(tx => {
      const copy = dbStore.copies.find(c => c.id === tx.copyId);
      const book = copy ? dbStore.books.find(b => b.id === copy.bookId) : undefined;
      return { ...tx, copy: copy ? { ...copy, book } : undefined };
    });

    const reservations = dbStore.reservations.filter(r => r.userId === id).map(res => {
      const copy = dbStore.copies.find(c => c.id === res.copyId);
      const book = copy ? dbStore.books.find(b => b.id === copy.bookId) : undefined;
      return { ...res, copy: copy ? { ...copy, book } : undefined };
    });

    const fines = dbStore.fines.filter(f => f.userId === id);

    return {
      ...member,
      borrowings,
      reservations,
      fines
    };
  }

  public toggleAccountStatus(id: string, adminId: string, adminName: string) {
    const member = dbStore.profiles.find(p => p.id === id);
    if (!member) throw new Error('Member not found');

    if (member.role === 'ADMIN') {
      throw new Error('Cannot deactivate administrator accounts');
    }

    member.status = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    member.updatedAt = new Date().toISOString();

    safeSync(() =>
      supabase.from('profiles').update({ status: member.status }).eq('id', id)
    );

    dbStore.activityLogs.unshift({
      id: `log-${Date.now()}`,
      userId: adminId,
      userName: adminName,
      action: 'MEMBER_STATUS_CHANGED',
      details: `${member.name}'s account status set to ${member.status}`,
      createdAt: new Date().toISOString()
    });

    return member;
  }
}

export const memberService = new MemberService();
