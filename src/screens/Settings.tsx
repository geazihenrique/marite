import { useEffect, useState } from 'react';
import type { AppData, Baby } from '../types';

type SettingsProps = {
  data: AppData;
  activeBaby: Baby;
  onSaveBaby: (baby: Baby) => void;
  onAddBaby: (name: string, birthDate: string) => void;
  onDeleteBaby: (babyId: string) => void;
  onSwitchBaby: (babyId: string) => void;
  onImport: (file: File) => void;
  onClear: () => void;
};

export function Settings({ data, activeBaby, onSaveBaby, onAddBaby, onDeleteBaby, onSwitchBaby, onImport, onClear }: SettingsProps) {
  const [name, setName] = useState(activeBaby.name);
  const [birthDate, setBirthDate] = useState(activeBaby.birthDate);
  const [newBabyName, setNewBabyName] = useState('');
  const [newBabyBirthDate, setNewBabyBirthDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(activeBaby.name);
    setBirthDate(activeBaby.birthDate);
    setError('');
  }, [activeBaby]);

  const validateBirthDate = (value: string) => {
    if (!value) return 'Informe a data de nascimento.';
    const selected = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected.getTime() > today.getTime()) return 'A data de nascimento não pode ser no futuro.';
    return '';
  };

  const saveBaby = () => {
    const validation = validateBirthDate(birthDate);
    if (validation) {
      setError(validation);
      return;
    }
    onSaveBaby({ ...activeBaby, name: name.trim() || 'Bebê', birthDate });
    setError('');
  };

  const addBaby = () => {
    const validation = validateBirthDate(newBabyBirthDate);
    if (validation) {
      setError(validation);
      return;
    }
    onAddBaby(newBabyName.trim(), newBabyBirthDate);
    setNewBabyName('');
    setNewBabyBirthDate('');
    setError('');
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jornada-mavie-dados-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="screen">
      <header className="screenHeader">
        <div>
          <p>Preferências</p>
          <h1>Configurações</h1>
        </div>
      </header>

      <section className="panel formPanel">
        <div className="sectionHeader">
          <h2>Perfil do bebê</h2>
        </div>
        <label>
          Nome do bebê
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do bebê" />
        </label>
        <label>
          Data de nascimento
          <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
        </label>
        {error ? <p className="fieldError">{error}</p> : null}
        <button className="primaryButton" type="button" onClick={saveBaby}>Salvar</button>
      </section>

      <section className="panel formPanel">
        <div className="sectionHeader">
          <h2>Bebês cadastrados</h2>
        </div>
        <div className="babyList">
          {data.babies.map((baby) => (
            <article className={baby.id === activeBaby.id ? 'babyListItem active' : 'babyListItem'} key={baby.id}>
              <button type="button" onClick={() => onSwitchBaby(baby.id)}>
                <strong>{baby.name}</strong>
                <span>{baby.birthDate}</span>
              </button>
              <button className="dangerButton" type="button" onClick={() => onDeleteBaby(baby.id)}>Excluir</button>
            </article>
          ))}
        </div>

        {data.babies.length >= 3 ? (
          <p className="fieldError">Limite de 3 bebês atingido.</p>
        ) : (
          <>
            <label>
              Nome do bebê
              <input value={newBabyName} onChange={(event) => setNewBabyName(event.target.value)} placeholder="Nome do bebê" />
            </label>
            <label>
              Data de nascimento
              <input type="date" value={newBabyBirthDate} onChange={(event) => setNewBabyBirthDate(event.target.value)} />
            </label>
            <button className="smallButton" type="button" onClick={addBaby}>Adicionar bebê</button>
          </>
        )}
      </section>

      <section className="panel formPanel">
        <div className="sectionHeader">
          <h2>Dados</h2>
        </div>
        <div className="settingsActions">
          <button type="button" onClick={exportJson}>Exportar dados</button>
          <label className="fileButton">
            Importar dados
            <input type="file" accept="application/json" onChange={(event) => event.target.files?.[0] && onImport(event.target.files[0])} />
          </label>
          <button className="dangerButton" type="button" onClick={onClear}>Limpar dados</button>
        </div>
      </section>

      <section className="panel appInfo">
        <div className="sectionHeader">
          <h2>Sobre o aplicativo</h2>
        </div>
        <p>Jornada Mavie organiza mamadas, sono, fraldas, rotina familiar e fórmula neste aparelho.</p>
        <p>Os dados ficam salvos localmente no navegador usado no iPhone.</p>
        <p className="medicalText">Este app apenas ajuda a organizar horários. Siga sempre a orientação médica.</p>
      </section>
    </main>
  );
}
