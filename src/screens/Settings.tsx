import { useRef, useState } from 'react';
import type { AppData } from '../types';
import { exportData, importDataFromFile } from '../utils/storage';

type SettingsProps = {
  data: AppData;
  onSaveProfile: (name: string) => void;
  onImport: (data: AppData) => void;
  onClear: () => void;
};

export function Settings({ data, onSaveProfile, onImport, onClear }: SettingsProps) {
  const [name, setName] = useState(data.profile.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (file?: File) => {
    if (!file) return;
    try {
      const imported = await importDataFromFile(file);
      onImport(imported);
      window.alert('Dados importados com sucesso.');
    } catch {
      window.alert('Não foi possível importar o arquivo.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <main className="screen">
      <header className="screenHeader">
        <div>
          <p>Preferências locais</p>
          <h1>Configurações</h1>
        </div>
      </header>

      <section className="panel formPanel">
        <label>
          Nome do bebê
          <input value={name} placeholder="Nome do bebê" onChange={(event) => setName(event.target.value)} />
        </label>
        <button className="primaryButton" type="button" onClick={() => onSaveProfile(name.trim())}>
          Salvar
        </button>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <h2>Dados</h2>
        </div>
        <div className="settingsActions">
          <button type="button" onClick={() => exportData(data)}>
            Exportar dados
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            Importar dados
          </button>
          <button className="dangerButton" type="button" onClick={onClear}>
            Limpar dados
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(event) => void handleImport(event.target.files?.[0])}
          />
        </div>
      </section>

      <section className="panel appInfo">
        <div className="sectionHeader">
          <h2>Sobre o aplicativo</h2>
        </div>
        <p>
          Rotina do Bebê é um PWA local para registrar mamadas, sono, trocas de fralda e lembretes de remédios definidos pela mãe.
        </p>
        <p className="medicalText">Este app apenas ajuda a organizar horários. Siga sempre a orientação médica.</p>
      </section>
    </main>
  );
}
