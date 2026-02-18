import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function ContactsIndex({ contacts, groups }: { contacts: any, groups: any[] }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        phone: '',
        group_id: '',
    });
    const [editingContact, setEditingContact] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingContact) {
            router.put(`/contacts/${editingContact.id}`, { ...data }, {
                onSuccess: () => { setIsOpen(false); reset(); setEditingContact(null); }
            });
        } else {
            post('/contacts', {
                onSuccess: () => { setIsOpen(false); reset(); }
            });
        }
    };

    const openEdit = (contact: any) => {
        setEditingContact(contact);
        setData({
            name: contact.name,
            phone: contact.phone,
            group_id: contact.group_id?.toString() || '',
        });
        setIsOpen(true);
    };

    const openCreate = () => {
        setEditingContact(null);
        setData({
            name: '',
            phone: '',
            group_id: '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure?')) {
            router.delete(`/contacts/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Contacts', href: '/contacts' }]}>
            <Head title="Contacts" />
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Contacts</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Contact</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingContact ? 'Edit Contact' : 'Create Contact'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Contact Name"
                                    />
                                    {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="+998..."
                                    />
                                    {errors.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="group">Group</Label>
                                    <Select value={data.group_id} onValueChange={val => setData('group_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map(group => (
                                                <SelectItem key={group.id} value={group.id.toString()}>{group.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.group_id && <div className="text-red-500 text-sm">{errors.group_id}</div>}
                                </div>
                                <Button type="submit" disabled={processing}>
                                    {editingContact ? 'Update' : 'Create'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Phone</th>
                                        <th className="px-4 py-3">Group</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.data.map((contact: any) => (
                                        <tr key={contact.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-3">{contact.id}</td>
                                            <td className="px-4 py-3">{contact.name}</td>
                                            <td className="px-4 py-3">{contact.phone}</td>
                                            <td className="px-4 py-3">{contact.group?.name || '-'}</td>
                                            <td className="px-4 py-3 flex space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(contact)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(contact.id)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {contacts.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-3 text-center text-gray-500">No contacts found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-between items-center text-sm">
                            <div>showing {contacts.from} to {contacts.to} of {contacts.total}</div>
                            <div className="flex gap-1">
                                {contacts.links.map((link: any, i: number) => (
                                    link.url ?
                                        <Link key={i} href={link.url} className={`px-2 py-1 border rounded ${link.active ? 'bg-gray-200' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        : <span key={i} className="px-2 py-1 border rounded text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
