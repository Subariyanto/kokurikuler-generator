import { PageHeader } from '../components/UI'
import { KKBC } from '../lib/constants'
import { HeartHandshake, HandHeart, ShieldCheck, MessageCircleHeart, Sprout, BookHeart, Sparkles, UsersRound, Star, Flag, Palette, GalleryHorizontal, SmilePlus, Gift } from 'lucide-react'

const ICONS = [
  <Sprout size={20} />,
  <Gift size={20} />,
  <ShieldCheck size={20} />,
  <MessageCircleHeart size={20} />,
  <Sprout size={20} />,
  <BookHeart size={20} />,
  <Sparkles size={20} />,
  <HeartHandshake size={20} />,
  <Star size={20} />,
  <Flag size={20} />,
  <Palette size={20} />,
  <GalleryHorizontal size={20} />,
  <SmilePlus size={20} />,
  <HandHeart size={20} />,
]

const COLORS = [
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-green-50 text-green-700 border-green-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-yellow-50 text-yellow-700 border-yellow-200',
  'bg-red-50 text-red-700 border-red-200',
  'bg-pink-50 text-pink-700 border-pink-200',
  'bg-violet-50 text-violet-700 border-violet-200',
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-lime-50 text-lime-700 border-lime-200',
]

export default function BankKKBC() {
  return (
    <div>
      <PageHeader title="Bank KKBC" subtitle="Kegiatan Kolaboratif Berbasis Cinta" />

      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl p-6 mb-6 text-white">
        <h2 className="text-lg font-bold">Kegiatan Kolaboratif Berbasis Cinta</h2>
        <p className="text-sm text-amber-100 mt-1">14 kegiatan penuh cinta yang memperkuat karakter dan kolaborasi murid.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KKBC.map((item, i) => {
          const colorClass = COLORS[i % COLORS.length]
          return (
            <div key={i} className={`rounded-xl border p-5 ${colorClass} hover:shadow-md transition-shadow`}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                  {ICONS[i] || <HeartHandshake size={20} />}
                </div>
                <div>
                  <span className="text-xs font-bold opacity-60 block mb-1">Kegiatan {i + 1}</span>
                  <h3 className="font-semibold text-sm leading-snug">{item}</h3>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
        <h3 className="font-semibold text-green-800 text-sm mb-2">💡 Tips Pemilihan KKBC</h3>
        <ul className="text-xs text-green-700 space-y-1 list-disc ml-4">
          <li>Pilih KKBC yang paling relevan dengan tema dan dimensi yang sudah dipilih</li>
          <li>Gabungkan 2-3 KKBC dalam satu kegiatan untuk memperkaya pengalaman belajar</li>
          <li>Sesuaikan intensitas KKBC dengan jenjang dan karakteristik murid</li>
          <li>Dokumentasikan momen KKBC sebagai bukti portofolio kegiatan</li>
        </ul>
      </div>
    </div>
  )
}