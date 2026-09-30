const fs = require('fs');
const file = 'c:/Users/maxsu/front-trilha/front_trilha_potiguara/src/app/(dashboard)/conquistas/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace('import Confetti from \'react-confetti\';', 'import Confetti from \'react-confetti\';\nimport { FogueiraIcon, MachadoIcon, PenaIcon, CocarIcon, OcaIcon, ArcoFlechaIcon } from \'@/components/icons/IndigenousIcons\';');

data = data.replace(/const renderIcon = \(iconeName: string\) => \{[\s\S]*?return <IconComponent className="w-7 h-7" \/>;\n  \};/, `const renderIcon = (iconeName: string) => {
    const IconMap: Record<string, React.ElementType> = {
      Star: PenaIcon,
      Trophy: CocarIcon,
      Target: ArcoFlechaIcon,
      Award: FogueiraIcon,
      Flame: FogueiraIcon,
      Sword: MachadoIcon,
      Shield: OcaIcon,
    };
    const IconComponent = IconMap[iconeName] || ((LucideIcons as Record<string, unknown>)[iconeName] as React.ElementType) || CocarIcon;
    return <IconComponent className="w-7 h-7" />;
  };`);

data = data.replace('<LucideIcons.Trophy className="w-12 h-12 text-white" />', '<CocarIcon className="w-12 h-12 text-white" />');

fs.writeFileSync(file, data);
