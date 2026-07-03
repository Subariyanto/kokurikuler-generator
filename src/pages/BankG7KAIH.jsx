import { PageHeader } from '../components/UI'
import { G7KAIH } from '../lib/constants'
import { Sun, Moon, Heart, Utensils, BookOpen, Users, Bed } from 'lucide-react'

const ICONS = {
  'Bangun pagi': <Sun size={20} />,
  'Beribadah': <Moon size={20} />,
  'Berolahraga': <Heart size={20} />,
  'Makan sehat dan bergizi': <Utensils size={20} />,
  'Gemar belajar': <BookOpen size={20} />,
  'Bermasyarakat': <Users size={20} />,
  'Tidur cepat': <Bed size={20} />,
}

const COLORS = [
  'from-green-500 to-emerald-600',
  'from-blue-500 to-indigo-600',
  'from-orange-500 to-red-500',
  'from-purple-500 to-pink-500',
  'from-teal-500 to-cyan-600',
  'from-yellow-500 to-amber-600',
  'from-indigo-500 to-violet-600',
]

export default function BankG7KAIH() {
  return (
    <div>
      <PageHeader title="Bank G7KAIH" subtitle="Gerakan 7 Kebiasaan Anak Indonesia Hebat" />

      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-6 mb-6 text-white">
        <h2 className="text-lg font-bold">Gerakan 7 Kebiasaan Anak Indonesia Hebat</h2>
        <p className="text-sm text-green-100 mt-1">Program pembiasaan positif untuk membentuk karakter unggul anak Indonesia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {G7KAIH.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`bg-gradient-to-r ${COLORS[i]} p-4 text-white flex items-center gap-3`}>
              <div className="p-2 bg-white/20 rounded-lg">{ICONS[item.kebiasaan] || <Heart size={20} />}</div>
              <div>
                <h3 className="font-bold text-sm">{item.kebiasaan}</h3>
                <p className="text-xs opacity-80">Kebiasaan {i + 1}</p>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Contoh Kegiatan</h4>
              <p className="text-sm text-gray-700">{item.contoh}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h3 className="font-semibold text-yellow-800 text-sm mb-2">💡 Tips Implementasi</h3>
        <ul className="text-xs text-yellow-700 space-y-1 list-disc ml-4">
          <li>Pilih 1-2 kebiasaan yang paling sesuai dengan tema kokurikuler yang dipilih</li>
          <li>Integrasikan kebiasaan ke dalam alur kegiatan harian</li>
          <li>Libatkan orang tua untuk melanjutkan pembiasaan di rumah</li>
          <li>Gunakan jurnal kebiasaan untuk memantau perkembangan murid</li>
        </ul>
      </div>
    </div>
  )
}