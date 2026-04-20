import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, X, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, ProductAPI } from '../lib/api';
import { useAuth } from '../store/authStore';

const CITIES = ['Dakar', 'Thiès', 'Saint-Louis', 'Touba', 'Kaolack', 'Mbour', 'Rufisque', 'Ziguinchor', 'Diourbel', 'Tambacounda'];

export default function PublishPage() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '', description: '', price: '', categoryId: '', city: 'Dakar',
  });
  const [images, setImages] = useState([]);
  const [imgUrl, setImgUrl] = useState('');
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(false);

  const catsQuery = useQuery({ queryKey: ['categories'], queryFn: ProductAPI.categories });

  const create = useMutation({
    mutationFn: (payload) => api.post('/products', payload).then((r) => r.data),
    onSuccess: (product) => {
      setSuccess(true);
      setTimeout(() => nav(`/produit/${product.id}`), 1200);
    },
    onError: (e) => setErr(e.response?.data?.error || { message: 'Erreur inconnue' }),
  });

  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const addImageUrl = () => {
    const url = imgUrl.trim();
    if (!url) return;
    if (images.length >= 6) return;
    setImages([...images, { url }]);
    setImgUrl('');
  };

  const removeImage = (i) => setImages(images.filter((_, j) => j !== i));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (images.length >= 6) return;
    const reader = new FileReader();
    reader.onload = () => setImages([...images, { url: reader.result }]);
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    setErr(null);
    if (!form.title || !form.description || !form.price || !form.categoryId) {
      return setErr({ message: 'Tous les champs avec * sont obligatoires' });
    }
    create.mutate({
      title: form.title,
      description: form.description,
      price: Number(form.price),
      city: form.city,
      categoryId: form.categoryId,
      images,
    });
  };

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Connecte-toi pour publier</h1>
        <Link to="/login?next=/publier" className="btn-primary inline-block">Se connecter</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Publier un produit</h1>
      <p className="text-slate-500 mb-6">Ton annonce sera visible après validation.</p>

      {success && (
        <div className="card bg-green-50 border-green-200 p-4 mb-4 flex items-center gap-2 text-green-800">
          <CheckCircle2 size={20} /> Annonce publiée ! Redirection…
        </div>
      )}

      {err?.code === 'SUBSCRIPTION_REQUIRED' && (
        <div className="card bg-amber-50 border-amber-200 p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={22} />
            <div className="flex-1">
              <h3 className="font-bold text-amber-900">Abonnement vendeur requis</h3>
              <p className="text-sm text-amber-800 mt-1">
                Pour publier des annonces, tu dois d'abord souscrire à l'abonnement vendeur
                (<strong>1 000 FCFA/mois</strong>) via l'application mobile.
              </p>
              <p className="text-xs text-amber-700 mt-2">
                💡 Pour tester, connecte-toi avec le compte demo :
                <br/><code className="bg-amber-100 px-1">demo@saucemarket.sn</code> / <code className="bg-amber-100 px-1">demo123</code>
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1">Titre *</label>
          <input className="input" value={form.title} onChange={setField('title')} placeholder="Ex : Samsung Galaxy A54 128Go" required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Photos (max 6)</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < 6 && (
              <label className="aspect-square border-2 border-dashed border-slate-300 rounded-lg grid place-items-center cursor-pointer hover:border-primary text-slate-400 hover:text-primary">
                <Upload size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              className="input flex-1"
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="Coller une URL d'image (optionnel)"
            />
            <button type="button" onClick={addImageUrl} className="btn-secondary">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Catégorie *</label>
            <select className="input" value={form.categoryId} onChange={setField('categoryId')} required>
              <option value="">Choisir…</option>
              {catsQuery.data?.items?.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Ville *</label>
            <select className="input" value={form.city} onChange={setField('city')} required>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Prix (FCFA) *</label>
          <input type="number" min="1" className="input" value={form.price} onChange={setField('price')} placeholder="85000" required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Description *</label>
          <textarea
            className="input min-h-[120px]"
            value={form.description}
            onChange={setField('description')}
            placeholder="Décris ton produit : état, taille, raison de la vente, conditions…"
            required
          />
        </div>

        {err && err.code !== 'SUBSCRIPTION_REQUIRED' && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {err.message}
          </div>
        )}

        <button type="submit" className="btn-primary w-full text-base" disabled={create.isPending}>
          {create.isPending ? 'Publication…' : 'Publier mon annonce'}
        </button>
      </form>
    </div>
  );
}
