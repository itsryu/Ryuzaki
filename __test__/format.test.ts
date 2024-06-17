import { Util } from '../src/Utils/util';

describe('formatDuration', () => {
  it('should format milliseconds into duration string', () => {
    expect(Util.formatDuration(86400000, 'pt-BR')).toBe('1 dia');
    expect(Util.formatDuration(90061000, 'pt-BR')).toBe('1 dia, 1 hora, 1 minuto e 1 segundo');
    expect(Util.formatDuration(3600000, 'pt-BR')).toBe('1 hora');
    expect(Util.formatDuration(3661000, 'pt-BR')).toBe('1 hora, 1 minuto e 1 segundo');
    expect(Util.formatDuration(60000, 'pt-BR')).toBe('1 minuto');
    expect(Util.formatDuration(61000, 'pt-BR')).toBe('1 minuto e 1 segundo');
    expect(Util.formatDuration(1000, 'pt-BR')).toBe('1 segundo');
    expect(Util.formatDuration(2000, 'pt-BR')).toBe('2 segundos');
    expect(Util.formatDuration(0, 'pt-BR')).toBe('');
  });
});