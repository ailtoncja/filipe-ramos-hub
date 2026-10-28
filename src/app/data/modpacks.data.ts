import { Modpack } from '../models/modpack.model';

export const MODPACKS: Modpack[] = [
  {
    jogo: 'Need for Speed: Most Wanted',
    descricao: 'Care Package completo para rodar o clássico.',
    imagemUrl: 'https://preview.redd.it/my-need-for-speed-most-wanted-20th-anniversary-edit-v0-8kt6aio6d81g1.jpeg?auto=webp&s=038a6ac64246cfa9505cb7297a888f2fa89c599b',
    itens: [{ label: 'Baixar Care Package', url: 'https://drive.google.com/file/d/1zRjjXGG6dYGpLw_Txfp6MIPRQWsiFdn3/view?usp=sharing' },
      { label: 'Baixar Game', url: 'https://archive.org/details/need-for-speed-most-wanted-repack-1.3' }
    ]
  },
  {
    jogo: 'Bloodborne',
    descricao: 'Mapas em alta resolução e o projeto editável do mundo do jogo.',
    imagemUrl: 'https://image.api.playstation.com/vulcan/img/rnd/202010/2614/NVmnBXze9ElHzU6SmykrJLIV.png?w=720',
    itens: [
      { label: 'Mapa 9000 x 10000', url: 'https://drive.google.com/file/d/1VS6cDpYdr-fAPv1wEIsReE0gaRfBZE0K/view?usp=drive_link' },
      { label: 'Mapa 4500 x 9000', url: 'https://drive.google.com/file/d/19bnXzqgcrhkOxfU3Pwb4ZxOqZY0XknRt/view?usp=drive_link' },
      { label: 'Projeto do mapa (.psd)', url: 'https://drive.google.com/file/d/1CkjUBKGNe97pvvbKpB6lhEzFm_8fmohY/view?usp=drive_link' }
    ]
  },
  {
    jogo: 'Dark Souls',
    descricao: 'Modpack principal e infográfico de upgrades de armas e talismãs.',
    imagemUrl: 'https://store-images.s-microsoft.com/image/apps.21855.69479559702140610.dad571dd-6b2c-42a6-be9e-fd11d891d66c.e16a97f5-c50d-4fe7-91fd-1ed4a19aaca7?q=90&w=480&h=270',
    itens: [
      { label: 'Baixar Care Package', url: 'https://drive.google.com/file/d/17YYeCdUKjgXE_dg53Jn8JXSye4OAstWA/view?usp=sharing' },
      { label: 'Infográfico de upgrades', url: 'https://drive.google.com/file/d/1zIgLAQAm7uTynY-dxzBx0dESU1Ioz9y2/view?usp=sharing' }
    ]
  },
  {
    jogo: 'Need for Speed: Underground 2',
    descricao: 'Care Package completo para rodar o clássico.',
    imagemUrl: 'https://gameplayscassi.com.br/wp-content/uploads/2024/11/Need-For-Speed-Underground-2.jpg',
    itens: [{ label: 'Baixar Care Package', url: 'https://drive.google.com/file/d/11SvsBEn50X6C3QjKMr5OLgSDvNO8atSB/view?usp=sharing' },
      { label: 'Baixar Game', url: 'https://www.myabandonware.com/game/need-for-speed-underground-2-ega#download' }
    ],
    notas: [
      {
        titulo: '⚠️ Atenção',
        texto: 'Ao entrar no MyAbandonWare, não esqueça de baixar a versão correta do jogo que seria a MagiPack.'
      }
    ]
  },
  {
    jogo: 'Beat Down: Fists of Vengeance',
    descricao: 'Pack completo com emulador PCSX2 configurado, retextura, patches e infográficos — ou baixe só a parte que precisa.',
    imagemUrl: 'https://twistedbard.com/wp-content/uploads/2016/04/119338-aleni.jpg',
    itens: [
      { label: 'Pack completo (sem .iso ou BIOS)', url: 'https://drive.google.com/file/d/1mpsdPthiy5FdJ5aq3JVWaYplUtoengp1/view?usp=sharing' },
      { label: 'Apenas a retextura (pasta "SLUS-21150" em Documents/PCSX2)', url: 'https://drive.google.com/file/d/1ApN0IPGlpE_xcfh6zIXVfaRB7ti1iqOC/view?usp=sharing' },
      { label: 'Infográfico (inglês)', url: 'https://drive.google.com/file/d/1b5XLhyGyxErsaGNSAI4-kTqVzFCXMO92/view?usp=sharing' },
      { label: 'Infográfico (PT-BR)', url: 'https://drive.google.com/file/d/1E0RYyUSlCgVtEXQAv8cAijRrrmaxtKVV/view?usp=sharing' },
      { label: 'Arquivo de cheats atualizado', url: 'https://drive.google.com/file/d/1HO2xrO_pXxs-T721UHvSSjqMOPJsxwQq/view?usp=sharing' }
    ]
  },
  {
    jogo: 'God Hand',
    descricao: 'Retextura do Jogo',
    imagemUrl: 'https://oyster.ignimgs.com/mediawiki/apis.ign.com/god-hand/3/3a/God-hand-logo.jpg',
    itens: [{ label: 'Baixar retextura', url: 'https://drive.google.com/file/d/13F3xptdnGi93c99Wkk4f-YOe-px74YWB/view?usp=sharing' }]
  },
  {
    jogo: 'Fallout: New Vegas',
    descricao: 'Modpack completo.',
    imagemUrl: 'https://cdn.mos.cms.futurecdn.net/YqaQ8StNTtu9JxC83EnJpD.jpg',
    itens: [{ label: 'Modpack completo (Fallout: New Vegas)', url: 'https://drive.google.com/file/d/11Rp6Om32mX7NyPmR5ZXiTpilKcZWBFQ7/view?usp=sharing' }]
  },
  {
    jogo: 'S.T.A.L.K.E.R.: Call of Pripyat',
    descricao: 'Lista de mods baixados e alterações feitas.',
    imagemUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP-AWPCb7DQeeTJ-3HoBQ3hA6NhRwsmSJVhjGR_ZCEZA&s=10',
    itens: [{ label: 'Ver lista de mods', url: 'https://drive.google.com/file/d/1BCmXzkV0Finpaan34LXIEPPoAG1IhoiN/view?usp=sharing' }]
  },
  {
    jogo: 'S.T.A.L.K.E.R.: Clear Sky',
    descricao: 'Lista de mods baixados e alterações feitas.',
    imagemUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2427420/d5c5f1c99ef319c4619217252d1e8ce31806bc90/capsule_616x353.jpg?t=1747757980',
    itens: [{ label: 'Ver lista de mods', url: 'https://drive.google.com/file/d/1tm2TgSD64ZJRfsW3JNQEcXhq0TEDI879/view?usp=sharing' }]
  },
  {
    jogo: 'S.T.A.L.K.E.R.: Shadow of Chernobyl',
    descricao: 'Lista de mods baixados e alterações feitas.',
    imagemUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2427410/7df10172386cd2b1b359f36705560c5686e6b203/capsule_616x353.jpg?t=1771270054',
    itens: [{ label: 'Ver lista de mods', url: 'https://drive.google.com/file/d/152s0Xo5PTZEty1xd3ukf2-PhYr8p2c1s/view?usp=sharing' }]
  },
  {
    jogo: 'Borderlands 3',
    descricao: 'Lista de mods — rushado e sem tutorial, mas tá aí.',
    imagemUrl: 'https://cdn2.unrealengine.com/bl3wide-2560x1440-2560x1440-462318f36bee20de4412e111ef72dc62-2560x1440-9c1f12a55f2b.jpg?resize=1&w=480&h=270&quality=medium',
    itens: [{ label: 'Ver lista de mods', url: 'https://drive.google.com/file/d/1pbPRuCi2NiwJ0IkBLnawQuGs1yB2JYfU/view?usp=sharing' }]
  },
  {
    jogo: 'Yu-Gi-Oh! Forbidden Memories',
    descricao: 'Mod de rebalanceamento de drops.',
    imagemUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmS7ppIBvks6V_tMk_uj4qRLdkQNgG7uuHFz69U4FjYIPeHnzQS7UE6ZyJ&s=10',
    itens: [{ label: 'Baixar mod', url: 'https://drive.google.com/file/d/1I0RW04BXT3taotrPSmDdf2pp2On0kXpx/view?usp=sharing' }]
  },
  {
    jogo: 'Yu-Gi-Oh! GX Tag Force',
    descricao: 'Pack de retextura.',
    imagemUrl: 'https://i.ytimg.com/vi/PjeVTpEIDLY/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDD3zBpHPdzzr3g9WtTrGVYSLILWA',
    itens: [{ label: 'Baixar retextura', url: 'https://drive.google.com/file/d/15CB4Drar8eYJlD2WSCrXywuvrSjFLYRr/view?usp=sharing' }]
  },
  {
    jogo: 'Yu-Gi-Oh! Capsule Monster Coliseum',
    descricao: 'Pack de retextura e infográfico.',
    imagemUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlwGGXOlsNswTyKOYjJHgwV_D-PsRuNvzlu_8EvL_hybY-dGiQKM8BU59H&s=10',
    itens: [
      { label: 'Baixar retextura', url: 'https://drive.google.com/file/d/1osYGS9EWHdAZ5dXiBFW82QiCd08HU1Zh/view?usp=sharing' },
      { label: 'Infográfico', url: 'https://drive.google.com/file/d/1nXJehB5T9oeQhPksM9Qz5JfHicURcKyN/view?usp=sharing' }
    ]
  },
  {
    jogo: 'Final Fantasy XII',
    descricao: 'Mod de rebalanceamento. Apenas em inglês, instruções no site da Nexus Mods.',
    imagemUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/595520/header.jpg',
    itens: [
      { label: 'Baixar Care Package', url: 'https://drive.google.com/file/d/1r5eON0XwRgVm5bje55li09X3T8vPzY2d/view?usp=sharing' },
      { label: 'Ver mod na Nexus Mods', url: 'https://www.nexusmods.com/finalfantasy12/mods/324' },
      { label: 'High Quality Preview Icons', url: 'https://www.nexusmods.com/finalfantasy12/mods/312' }
    ]
  },
  {
    jogo: 'Fallout 2',
    descricao: 'Pack de mods configurados.',
    imagemUrl: 'https://cdn1.epicgames.com/offer/aae22da1fb884fa395b25bc30dd61faf/EGS_Fallout2APostNuclearRolePlayingGame_BethesdaGameStudios_S1_2560x1440-4cfbea54e590ef00cb9c440ac3b3a36c',
    itens: [{ label: 'Baixar pack de mods', url: 'https://drive.google.com/file/d/1CClCdUzQv4pRdQQwAuZZXURv0rnuueP0/view?usp=sharing' }]
  },
  {
    jogo: 'Gran Turismo 4',
    descricao: 'Versão modificada do jogo.',
    imagemUrl: 'https://m.media-amazon.com/images/I/711ajLo2y+L._UF1000,1000_QL80_.jpg',
    itens: [{ label: 'Baixar versão modificada', url: 'https://drive.google.com/file/d/18xXbKxnPoReJKwuBYT2KUtgWsa0P0sKi/view?usp=sharing' }]
  },
  {
    jogo: 'Monster Hunter: World',
    descricao: 'Pack de mods e infográfico.',
    imagemUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582010/capsule_616x353.jpg?t=1773328926',
    itens: [
      { label: 'Baixar pack de mods', url: 'https://drive.google.com/file/d/1x7UhSnpcjSMunPFbhbzoXOyqbpcJIK_y/view?usp=sharing' },
      { label: 'Infográfico', url: 'https://drive.google.com/file/d/1a4jFwgMALxmuP9C2ewfliBZ6u_Asg1zp/view?usp=sharing' },
      { label: 'No Ciri and Geralt Fake Swords', url: 'https://www.nexusmods.com/monsterhunterworld/mods/6457' }
    ]
  },
  {
    jogo: 'Resident Evil 5',
    descricao: 'Pack de mods usados na série.',
    imagemUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX-9qwBcaIeS-UlDuqbUeeupzmCzrMzYxTFKArIKTuYMxb8tie3ewJPlk&s=10',
    itens: [{ label: 'Baixar pack de mods', url: 'https://drive.google.com/file/d/1bPLdkzmrZt6Jphs8fYO7roMkSX_LfaON/view?usp=sharing' }]
  },
  {
    jogo: 'Resident Evil: Revelations 2',
    descricao: 'Pack de mods usados na série.',
    imagemUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/287290/header.jpg?t=1769125412',
    itens: [{ label: 'Baixar pack de mods', url: 'https://drive.google.com/file/d/1B12EIA5cPURDRjRSHYNsJlJKO8TJQhau/view?usp=sharing' }]
  },
  {
    jogo: 'GTA IV',
    descricao: 'Pack de mods para a versão mais atualizada do jogo.',
    imagemUrl: 'https://store-images.s-microsoft.com/image/apps.63395.70888664566520664.37586a44-7029-4b4c-b5c8-48c5b7cfcc6d.c561d57d-3fd8-4f22-acc8-3312a71e771b?q=90&w=480&h=270',
    itens: [
      { label: 'Pack de mods (atualizado)', url: 'https://drive.google.com/file/d/18vYY35DD6uG_YesVq3r6Gs4F_08yc7JT/view?usp=sharing' },
      { label: 'Pack de mods (versão antiga)', url: 'https://drive.google.com/file/d/1zljSp6SnqsYGtMO7JkWO9blzZZEqxgMm/view?usp=sharing' }
    ]
  },
  {
    jogo: 'Deadly Premonition',
    descricao: 'Care Package completo.',
    imagemUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/247660/capsule_616x353.jpg?t=1728655653',
    itens: [{ label: 'Baixar Care Package', url: 'https://drive.google.com/file/d/14r7iYai2BTqPba7pLJILC-vAXyl-Q3_p/view?usp=sharing' }]
  },
  {
    jogo: 'Need for Speed (2015)',
    descricao: 'Pack de mods.',
    imagemUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1262540/page_bg_raw.jpg?t=1777394657',
    itens: [{ label: 'Baixar pack de mods', url: 'https://drive.google.com/file/d/1Ykuy4nCUF-8uPW-Ub_Gp5gOrxyKWqg6g/view?usp=sharing' }]
  },
  {
    jogo: 'GTA: San Andreas',
    descricao: 'Pack de mods.',
    imagemUrl: 'https://sm.ign.com/t/ign_br/news/g/gta-san-an/gta-san-andreas-vr-delayed-indefinitely-as-meta-focuses-on-o_hz21.1200.jpg',
    itens: [{ label: 'Baixar pack de mods', url: 'https://drive.google.com/file/d/1nMjFCoO5_QW_yzaVMQraV2rMKKChlqlY/view?usp=sharing' }]
  },
  {
    jogo: 'Sons of the Forest',
    descricao: 'Infográfico do jogo.',
    imagemUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1326470/capsule_616x353.jpg?t=1708624856',
    itens: [{ label: 'Baixar infográfico', url: 'https://drive.google.com/file/d/1jApMSo7lZ8Kg2O_KeBnaaLSt8NMRsyb-/view?usp=sharing' }]
  },
  {
    jogo: 'Resident Evil 4 Remake',
    descricao: 'Tabela de armas.',
    imagemUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/capsule_616x353.jpg?t=1772502922',
    itens: [
      { label: 'Tabela de armas (inglês)', url: 'https://drive.google.com/file/d/1qjbzlJdflKbTnPb13YxNh26aMWR9WyxD/view?usp=sharing' },
      { label: 'Tabela de armas (PT-BR)', url: 'https://drive.google.com/file/d/1CtAFP-oNOTF8AcjrXitoAY5JVIWUVZdt/view?usp=sharing' },
      { label: 'Tighter Shotgun Spread', url: 'https://www.nexusmods.com/residentevil42023/mods/442' }
    ]
  },
  {
    jogo: 'GTA San Andreas: Enhanced Edition',
    descricao: 'Vídeo tutorial de como baixar e instalar, e o modpack em si.',
    imagemUrl: 'https://sm.ign.com/t/ign_br/news/g/gta-san-an/gta-san-andreas-vr-delayed-indefinitely-as-meta-focuses-on-o_hz21.1200.jpg',
    itens: [
      { label: 'Vídeo tutorial (como baixar)', url: 'https://www.youtube.com/watch?v=38OkRFX41K4' },
      { label: 'Modpack Enhanced Edition', url: 'https://mega.nz/file/RwxiHTpb#ayDlu32bjhs6VAD9OV0p9BOsTXh9H8BF03i0RxAQ9Ss' }
    ]
  },
  {
    jogo: 'Cyberpunk 2077',
    descricao: 'Coleção de mods para a série.',
    imagemUrl: 'https://cdn1.epicgames.com/offer/77f2b98e2cef40c8a7437518bf420e47/EGS_Cyberpunk2077_CDPROJEKTRED_S1_03_2560x1440-359e77d3cd0a40aebf3bbc130d14c5c7',
    itens: [
      { label: 'Ver coleção na Nexus Mods', url: 'https://www.nexusmods.com/games/cyberpunk2077/collections/tydihx' },
      { label: 'Simple Loot Icons (desatualizado)', url: 'https://www.nexusmods.com/cyberpunk2077/mods/3365' }
    ],
    grupos: [
      {
        titulo: 'Requisitos (instale primeiro)',
        mods: [
          { label: 'Cyber Engine Tweaks', url: 'https://www.nexusmods.com/cyberpunk2077/mods/107' },
          { label: 'REDscript', url: 'https://www.nexusmods.com/cyberpunk2077/mods/1511' },
          { label: 'TweakXL', url: 'https://www.nexusmods.com/cyberpunk2077/mods/4197' },
          { label: 'RED4ext', url: 'https://www.nexusmods.com/cyberpunk2077/mods/2380' },
          { label: 'Native Settings UI', url: 'https://www.nexusmods.com/cyberpunk2077/mods/3518' },
          { label: 'cybercmd', url: 'https://www.nexusmods.com/cyberpunk2077/mods/5176' }
        ]
      },
      {
        titulo: 'Visual, HUD e imersão',
        mods: [
          { label: 'FX Begone - Vignette', url: 'https://www.nexusmods.com/cyberpunk2077/mods/9209' },
          { label: 'FX Begone - Inventory', url: 'https://www.nexusmods.com/cyberpunk2077/mods/9209' },
          { label: 'Blur Begone', url: 'https://www.nexusmods.com/cyberpunk2077/mods/8105' },
          { label: 'Extra Clean Hacking Screen', url: 'https://www.nexusmods.com/cyberpunk2077/mods/4381' },
          { label: 'Minimalist Loot Icon', url: 'https://www.nexusmods.com/cyberpunk2077/mods/9379' },
          { label: 'Non-Hideable HUD Removal', url: 'https://www.nexusmods.com/cyberpunk2077/mods/555' },
          { label: 'Hide Distant 2D Cars', url: 'https://www.nexusmods.com/cyberpunk2077/mods/1282' },
          { label: 'Ragdoll Physics Overhaul', url: 'https://www.nexusmods.com/cyberpunk2077/mods/3858' },
          { label: 'More Blood Splatters', url: 'https://www.nexusmods.com/cyberpunk2077/mods/3975' },
          { label: 'Status Effect Adjust', url: 'https://www.nexusmods.com/cyberpunk2077/mods/9659' }
        ]
      },
      {
        titulo: 'Gameplay e armas',
        mods: [
          { label: 'Unequip Mods', url: 'https://www.nexusmods.com/cyberpunk2077/mods/2358' },
          { label: 'Auto Unequip Weapon Mods And Attachments When Selling Or Disassembling', url: 'https://www.nexusmods.com/cyberpunk2077/mods/9604' },
          { label: 'Item Modification Unlocker', url: 'https://www.nexusmods.com/cyberpunk2077/mods/9449' },
          { label: 'First Person Camera - Custom Weapons, Vehicles, On Foot Views and FOV', url: 'https://www.nexusmods.com/cyberpunk2077/mods/1786' },
          { label: 'Only Smartweapon Crosshairs', url: 'https://www.nexusmods.com/cyberpunk2077/mods/5434' },
          { label: 'Simple Flashlight', url: 'https://www.nexusmods.com/cyberpunk2077/mods/2913' },
          { label: 'Custom Max Ammo - Fully customizable', url: 'https://www.nexusmods.com/cyberpunk2077/mods/8090' }
        ]
      },
      {
        titulo: 'Correções',
        mods: [
          { label: 'Fix Skill Progression Rewards Not Applying', url: 'https://www.nexusmods.com/cyberpunk2077/mods/9879' }
        ]
      }
    ]
  },
  {
    jogo: 'Terraria',
    descricao: 'Pacote de texturas em alta definição (HD).',
    imagemUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg?t=1769844435',
    itens: [{ label: 'Baixar retextura HD', url: 'https://github.com/sullerandras/terraria-hd-textures/releases/tag/v0.16.2-1.4.4.9' }]
  },
  {
    jogo: 'Baldur\'s Gate 3',
    descricao: 'Mods usados na série, com o motivo de cada um e a config de controle.',
    imagemUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202308/1519/95cce955dc59d04e2ea5ab624a823ace14e9c5f7e24dfb8f.png',
    itens: [],
    grupos: [
      {
        titulo: 'Requisitos (instale primeiro)',
        mods: [
          { label: 'Script Extender', url: 'https://github.com/Norbyte/bg3se/releases', descricao: 'Requerimento básico pra um monte de mod.' },
          { label: 'Mod Fixer', url: 'https://www.nexusmods.com/baldursgate3/mods/141', descricao: 'Requerimento básico pra um monte de mod.' }
        ]
      },
      {
        titulo: 'Câmera, interface e qualidade de vida',
        mods: [
          { label: 'BG3 Native Camera Tweaks', url: 'https://www.nexusmods.com/baldursgate3/mods/945', descricao: 'Destrava o eixo vertical da câmera e habilita um monte de configuração extra dela, indispensável pra quem joga no controle.' },
          { label: 'No Camera Move', url: 'https://www.nexusmods.com/baldursgate3/mods/5046', descricao: 'Evita que a câmera mexa sozinha ou volte pro personagem ao realizar um ataque à distância. (pulta q o pariu q diferença isso faz)' },
          { label: 'Visible Shields', url: 'https://www.nexusmods.com/baldursgate3/mods/492', descricao: 'Escudos aparecem nas costas dos personagens fora de batalha.' },
          { label: 'Rich Traders', url: 'https://www.nexusmods.com/baldursgate3/mods/2432', descricao: 'Vendedores têm 50k de gold a mais. (só é possível roubar os valores que passam de 50k)' },
          { label: 'Clear Map, Transparent Shroud', url: 'https://www.nexusmods.com/baldursgate3/mods/2256?tab=files&file_id=32241', descricao: 'Limpa a grade do mapa e deixa as partes não exploradas visíveis.' },
          { label: 'ICUI - Lower Right Corner', url: 'https://www.nexusmods.com/baldursgate3/mods/4925?tab=files&file_id=33194', descricao: 'Remove as informações de classe do personagem no canto da tela. (na interface de controle)' },
          { label: 'ICUI - Party Portrait', url: 'https://www.nexusmods.com/baldursgate3/mods/4925?tab=files&file_id=33195', descricao: 'Remove as fotinhas dos personagens do canto da tela. (na interface de controle)' }
        ]
      },
      {
        titulo: 'Transmog e aparência',
        mods: [
          { label: 'Transmog Enhanced', url: 'https://www.nexusmods.com/baldursgate3/mods/2922?tab=files&file_id=40671', descricao: 'Sistema de transmog básico.' },
          { label: 'TE Hide Appearance Ring', url: 'https://www.nexusmods.com/baldursgate3/mods/2922?tab=files&file_id=21033', descricao: 'Complemento pro mod de transmog q adiciona um anel pra esconder itens.' },
          { label: 'Everybody Dyes', url: 'https://www.nexusmods.com/baldursgate3/mods/936', descricao: 'Tintas não são gastas ao serem usadas.' }
        ]
      },
      {
        titulo: 'NG+ e testes de build',
        mods: [
          { label: 'Save Restore Stash', url: 'https://www.nexusmods.com/baldursgate3/mods/4958', descricao: 'O mais perto q consegui chegar de um mod de NG+, ele salva os itens equipados do grupo em um arquivo e vc pode pegar esses itens em outro save.' },
          { label: 'Party Limit Begone', url: 'https://www.nexusmods.com/baldursgate3/mods/327', descricao: 'Remove o limite de tamanho do grupo, eu usei pra facilitar a passagem de itens de um save pra outro, não recomendo usar fora, grupo grande fode com o FPS.' },
          { label: 'Level 12 on Beach', url: 'https://www.nexusmods.com/baldursgate3/mods/4258', descricao: 'N achei mod q carregasse minha progressão completa pra outro save, nv12 na praia é o mais perto q consigo chegar.' },
          { label: 'Ring of Extra Health', url: 'https://www.nexusmods.com/baldursgate3/mods/1170', descricao: 'Um anel q dá 5k de HP, eu uso pra criar \'target dummies\' no acampamento usando hirelings e ficar testando builds.' },
          { label: 'Tutorial Chest Summoning', url: 'https://www.nexusmods.com/baldursgate3/mods/457', descricao: 'Usei pra spawnar o anel de 5k de vida pros dummies de acampamento. Inútil além disso.' }
        ]
      }
    ],
    notas: [
      {
        titulo: '🎮 Minha config de controle',
        texto: 'Copie e cole o código abaixo no seu arquivo "inputconfig_p1.json", localizado em:\nC:\\Users\\XXXXX\\AppData\\Local\\Larian Studios\\Baldur\'s Gate 3\\PlayerProfiles\\Public (XXXXX = nome do usuário)\n\nIsso permite vc atacar diretamente com o analógico direito, ver cones de visão e itens na tela com LB/L1 e pular diálogos com B/O pra n clicar em opções sem querer.',
        codigo: '{\n  DestructionToggle: [ "c:rightstickpress" ],\n  UISkipDialog : [ "c:b" ],\n  ToggleSpellsEnd: [],\n  ShowWorldTooltips: [ "c:leftshoulder" ],\n  ShowSneakCones: [ "c:leftshoulder" ]\n}'
      },
      {
        titulo: '❓ Por que não jogar normalmente pra gente ver a dificuldade do jogo?',
        texto: 'A dificuldade tactician e o ritmo natural do jogo é maravilhoso, mas BG3 é um jogo extremamente lento e meticuloso, algumas batalhas levam HORAS e pra se preparar pegando tudo e explorando cada canto são ainda MAIS horas, a minha primeira run durou mais de 200, eu queria muito jogar a história em live mas existe 0 chances d\'eu jogar nesse ritmo, por outro lado eu amo NG+ em jogos, eu tenho apego por tudo que eu peguei ao longo do jogo e quero fazer uma run mais tranquila, experimental, sem me preocupar com farm, XP, fazendo uso de builds diferentes e criativas, o resultado disso é um gameplay que flui mais em lives. Sim, o ato 1 e 2 vão ser DESTRUÍDOS, mas isso quer dizer que as 150 horas que passei neles na primeira run vão ser resumidos em 15-20hrs. (espero eu)\n\nE vale lembrar que assim que eu chegar no ato 3 (onde vc atinge lv12 em poucas horas e pode pegar basicamente qualquer item end-game poderoso) o balanceamento volta ao normal e vc vai poder ter uma noção do que o gameplay seria em um jogo sem mod.'
      }
    ]
  },
  {
    jogo: 'Skyrim',
    descricao: 'Mods usados na série.',
    imagemUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2019/aDSOgerXg4V6sf5A7VzHiTun.jpg',
    itens: [
      { label: 'SkyUI', url: 'https://www.nexusmods.com/skyrim/mods/3863' },
      { label: 'Less Intrusive HUD II', url: 'https://www.nexusmods.com/skyrim/mods/35154' },
      { label: 'Better Magic', url: 'https://www.nexusmods.com/skyrim/mods/4374' },
      { label: 'Realistic Ragdolls and Force', url: 'https://www.nexusmods.com/skyrim/mods/601' },
      { label: 'Upgradeable and Craftable Silver Weapons', url: 'https://www.nexusmods.com/skyrim/mods/8905?tab=2&navtag=%2Fajax%2Fmodfiles%2F%3Fid%3D8905&pUp=1' },
      { label: 'Vídeo tutorial (como instalar)', url: 'https://www.youtube.com/watch?v=0dGNbX0Oa0o&t=10s&pp=0gcJCaMLAYcqIYzv' }
    ]
  },
  {
    jogo: 'Resident Evil 4 (Clássico)',
    descricao: 'Projeto de melhoria gráfica (HD) e patch para tela widescreen.',
    imagemUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202010/0501/ph4tgwDaQqHkj84fKrGjye8D.png',
    itens: [
      { label: 'RE4 HD Project', url: 'https://re4hd.com/?page_id=6064' },
      { label: '4GB Patch (widescreen)', url: 'https://ntcore.com/4gb-patch/' },
      { label: 'Vídeo tutorial (como instalar)', url: 'https://www.youtube.com/watch?v=mYFN8cMjgdg&t=11s' }
    ]
  },
  {
    jogo: 'Pathologic Classic HD',
    descricao: 'Mods para a versão clássica do jogo.',
    imagemUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/384110/capsule_616x353.jpg?t=1604189746',
    itens: [
      { label: '1080p Remastered HUD', url: 'https://www.nexusmods.com/pathologicclassichd/mods/6?tab=description' },
      { label: 'Guia: Improving Graphics and Fixing Technical Issues', url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=2358626115' },
      { label: 'Pathologic: Relapse', url: 'https://www.moddb.com/mods/pathologic-relapse' },
      { label: 'Vídeo tutorial (como instalar)', url: 'https://www.youtube.com/watch?v=Fpc6R1o5D68' }
    ]
  },
  {
    jogo: 'Watch Dogs',
    descricao: 'Mod de melhoria gráfica.',
    imagemUrl: 'https://image.api.playstation.com/vulcan/img/rnd/202010/0919/c5hGXITrBuuQZgY2yvX3oyQV.jpg',
    itens: [
      { label: 'TheWorse Mod', url: 'https://www.guru3d.com/download/watch-dogs-theworse-mod-8-download' },
      { label: 'Vídeo tutorial (como instalar)', url: 'https://www.youtube.com/watch?v=jzzzFR9r6YE' }
    ]
  },
  {
    jogo: 'Borderlands 2',
    descricao: 'Care Package completo.',
    imagemUrl: 'https://cdn1.epicgames.com/f4a7772a4da24870a3ea6dfb8aeac662/offer/EGS_Borderlands2_GearboxSoftware_S1-2560x1440-e4f153cd792f973e00583178d8408128.jpg',
    itens: [
      { label: 'Baixar Care Package', url: 'https://mega.nz/file/Z9JXgCZR#Kuo_glJaFruk4AIG0v6gywSDisnIBOt0tnSCMs_0Abk' },
      { label: 'Vídeo tutorial (como instalar)', url: 'https://www.youtube.com/watch?v=LyKZ-2_-yR4&t=31s' }
    ]
  },
  {
    jogo: 'Dragon\'s Dogma',
    descricao: 'ENB + mods, com opção sem limite de peso no inventário.',
    imagemUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367500/capsule_616x353.jpg?t=1768870344',
    itens: [
      { label: 'ENB + Mods (normal)', url: 'https://mega.nz/file/9tYgGCJC#InG3lbLVQ_bkdtc9n8nxt4QQuIjy6vkh1m96TFKj1C8' },
      { label: 'ENB + Mods (No Carry Weight)', url: 'https://mega.nz/file/ttBQ0Y5B#lJzzb9wMG2_hjG_bUGkc6lP6ck2lQddj2emfoNmFv0k' }
    ]
  },
  {
    jogo: 'Fallout 76',
    descricao: 'Mods usados na série, mais um ajuste de configuração (Fallout76Custom.ini).',
    imagemUrl: 'https://cms-assets.xboxservices.com/assets/d9/2d/d92d2967-799a-48f8-941c-9d88ca6dcb5c.jpg?n=Fallout-76-Burning-Springs_Sneaky-Slider-1084_1600x675.jpg',
    itens: [
      { label: 'Keretus\' Improved Health Bars', url: 'https://www.nexusmods.com/fallout76/mods/2966' },
      { label: 'Clean Radium Rifle', url: 'https://www.nexusmods.com/fallout76/mods/215' },
      { label: 'Hide - Disable Jetpack Visuals', url: 'https://www.nexusmods.com/fallout76/mods/2871' },
      { label: 'Clear descriptions and scrap names (desatualizado)', url: 'https://www.nexusmods.com/fallout76/mods/1814' }
    ],
    notas: [
      {
        titulo: '⚙️ Como aplicar as linhas de configuração (só PC)',
        passos: [
          'Feche o jogo. Os arquivos .ini só devem ser mexidos com o Fallout 76 fechado.',
          'Abra a pasta Documentos > My Games > Fallout 76.',
          'Procure o arquivo Fallout76Custom.ini (Steam) ou Project76Custom.ini (Xbox / Microsoft Store). Se ele já existir, pule direto para o passo 6.',
          'Se não existir: copie o Fallout76.ini (ou Project76.ini) e cole na mesma pasta. Abra a cópia, apague tudo (Ctrl+A e Delete) e salve, deixando o arquivo vazio.',
          'Renomeie a cópia trocando o "- Copia" por "Custom", sem mexer no começo do nome: fica Fallout76Custom.ini (ou Project76Custom.ini).',
          'Abra o arquivo Custom, clique em "Copiar" abaixo, cole as linhas no final do arquivo e salve.',
          'Pronto, é só abrir o jogo. Para desfazer, apague essas linhas do arquivo Custom.'
        ],
        dica: 'Se os arquivos aparecem sem o ".ini" no nome, ative "Exibir > Extensões de nomes de arquivos" no Explorador. Senão o arquivo pode virar Fallout76Custom.ini.txt e o jogo ignora. Se o seu Custom já tiver a linha [EnlightenDebug], cole só as duas linhas de baixo embaixo dela.',
        codigo: '[EnlightenDebug]\nfSkyCubemapMaxVisibility=0.30\nfSkyCubemapMinVisibility=0.20'
      }
    ]
  },
  {
    jogo: 'Dragon\'s Dogma 2',
    descricao: 'Mods de interface e balanceamento.',
    imagemUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2054970/capsule_616x353.jpg',
    itens: [
      { label: 'Baixar Care Package', url: 'https://drive.google.com/file/d/1jgHKQaAJJZ4jXjCbKXeiY_e2Y3I6hmt_/view?usp=sharing' },
      { label: 'Clear Effect Descriptions (atualizado por um fã)', url: 'https://www.nexusmods.com/dragonsdogma2/mods/1619' },
      { label: 'Clear Effect Descriptions (desatualizado)', url: 'https://www.nexusmods.com/dragonsdogma2/mods/314' },
      { label: 'End-Game Stats for All Dragonforged Equipment (desatualizado)', url: 'https://www.nexusmods.com/dragonsdogma2/mods/410' }
    ]
  },
  {
    jogo: 'Lightning Returns: Final Fantasy XIII',
    descricao: 'Mods de interface e gameplay.',
    imagemUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/345350/capsule_616x353.jpg',
    itens: [
      { label: 'All Shields Invisible', url: 'https://www.nexusmods.com/lightningreturnsfinalfantasy13/mods/28' },
      { label: 'Cleaner HUD', url: 'https://www.nexusmods.com/lightningreturnsfinalfantasy13/mods/29' },
      { label: 'Gameplay Tweaks', url: 'https://www.nexusmods.com/lightningreturnsfinalfantasy13/mods/30' }
    ]
  },
  {
    jogo: 'Final Fantasy XIII',
    descricao: 'Mods de câmera e gameplay.',
    imagemUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292120/capsule_616x353.jpg',
    itens: [
      { label: 'Centered Camera', url: 'https://www.nexusmods.com/finalfantasy13/mods/74' },
      { label: 'Less Grinding', url: 'https://www.nexusmods.com/finalfantasy13/mods/73' }
    ]
  },
  {
    jogo: 'Resident Evil Requiem',
    descricao: 'Mod que substitui os ícones do inventário por imagens dos modelos 3D. Requer Fluffy Mod Manager.',
    imagemUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3764200/ce5437442768e38eb575f205ab9397d0264017b0/header.jpg',
    itens: [
      { label: '3D Icons', url: 'https://www.nexusmods.com/residentevilrequiem/mods/1049' }
    ]
  },
  {
    jogo: 'The Elder Scrolls IV: Oblivion Remastered',
    descricao: 'Care Package para The Elder Scrolls IV: Oblivion Remastered.',
    imagemUrl: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2623190/a7cee9165bb1bfc092c390c5cff215ce0e381dfc/header.jpg',
    itens: [
      { label: 'Baixar Care Package', url: 'https://www.mediafire.com/file/xtmyiq78lccck4x/Drag_%2526_Drop_-_OBLIVION_REMASTERED.zip/file' }
    ]
  },
  {
    jogo: 'Midnight Club 3: DUB Edition Remix',
    descricao: 'Retextura em HD e pack de carros melhorados.',
    imagemUrl: 'https://upload.wikimedia.org/wikipedia/en/6/69/Midnight_Club_3_-_DUB_Edition_Coverart.jpg',
    itens: [
      { label: 'Baixar retextura HD (by Moataz)', url: 'https://www.mediafire.com/file/km8dx7lkswyuv2z/Midnight_Club_3_Remix_HD_Textures_by_Moataz.rar/file' },
      { label: 'MC3 - Enhanced Vehicle Pack 1', url: 'https://www.nexusmods.com/midnightclub3dubeditionremix/mods/3' }
    ]
  },
  {
    jogo: 'The Witcher 3: Wild Hunt',
    descricao: 'Care Package drag & drop com 17 mods já mesclados. Feito para a versão Next-Gen 4.04 (Steam ou GOG).',
    imagemUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/capsule_616x353.jpg',
    itens: [
      { label: 'Baixar Care Package (só versão 4.04, leia os avisos abaixo)', url: 'https://drive.google.com/file/d/1oSMsk_P2UZsuVN2gjPDWED2LBi7Y4Li2/view?usp=sharing' },
      { label: 'Script Merger (usado pra mesclar, já vem pronto no pack)', url: 'https://www.nexusmods.com/witcher3/mods/484' }
    ],
    grupos: [
      {
        titulo: 'Mapa e interface',
        mods: [
          { label: 'All Quest Objectives On Map', url: 'https://www.nexusmods.com/witcher3/mods/943', descricao: 'Mostra no mapa os objetivos de todas as quests ativas ao mesmo tempo.' },
          { label: 'No Levels for All Quest Objectives on Map', url: 'https://www.nexusmods.com/witcher3/mods/4256', descricao: 'Patch que faz o mod acima funcionar com o No Levels, tirando o nível das quests no mapa.' },
          { label: 'Fast Travel From Anywhere', url: 'https://www.nexusmods.com/witcher3/mods/7157', descricao: 'Viagem rápida direto pelo mapa, sem precisar ir até uma placa.' },
          { label: 'No Talk Icon NEXT GEN', url: 'https://www.nexusmods.com/witcher3/mods/10107', descricao: 'Esconde o balãozinho de fala em cima dos NPCs.' },
          { label: 'Unified Oil Icons', url: 'https://www.nexusmods.com/witcher3/mods/4785', descricao: 'Óleos de todos os níveis usam o mesmo ícone, só muda a cor do fundo.' }
        ]
      },
      {
        titulo: 'Gameplay, loot e economia',
        mods: [
          { label: 'No Levels', url: 'https://www.nexusmods.com/witcher3/mods/3605', descricao: 'Tira o escalonamento por nível: itens sem requisito de nível e inimigos com status fixos. O nível só dá pontos de habilidade.' },
          { label: 'No Decorative Container Looting', url: 'https://www.nexusmods.com/witcher3/mods/2944', descricao: 'Barris, cestos e caixotes deixam de ser saqueáveis, só baús. Tem menu em Opções > Mods.' },
          { label: 'No Junk Weapon Drops + No Junky Junk Drops', url: 'https://www.nexusmods.com/witcher3/mods/2881', descricao: 'Inimigos param de dropar armas comuns e lixo.' },
          { label: 'Less Junk', url: 'https://www.nexusmods.com/witcher3/mods/7239', descricao: 'Remove o lixo comum de baús e dos drops de monstros.' },
          { label: 'Disable Useless Haft-Junk-Crafting', url: 'https://www.nexusmods.com/witcher3/mods/6929', descricao: 'Tira a receita inútil de cabo (haft) da criação.' },
          { label: 'Stack Your Items', url: 'https://www.nexusmods.com/witcher3/mods/7175', descricao: 'Comida, ingredientes, virotes e outros itens empilham até 10000.' }
        ]
      },
      {
        titulo: 'Visual e câmera',
        mods: [
          { label: 'Enhanced Water Restored', url: 'https://www.nexusmods.com/witcher3/mods/12655', descricao: 'Água bem mais bonita.' },
          { label: 'Pesky sword trails begone', url: 'https://www.nexusmods.com/witcher3/mods/924', descricao: 'Remove o rastro colorido das espadas.' },
          { label: 'No Witcher Sense Zoom FX', url: 'https://www.nexusmods.com/witcher3/mods/351', descricao: 'Tira o zoom e os efeitos de câmera do sentido de bruxo.' },
          { label: 'Smooth Camera Motion', url: 'https://www.nexusmods.com/witcher3/mods/7155', descricao: 'Tira o balanço da câmera quando o Geralt corre.' },
          { label: 'Slim Gloves', url: 'https://www.nexusmods.com/witcher3/mods/4646', descricao: 'Deixa as luvas do Geralt mais finas.' },
          { label: 'Skippy Skippy', url: 'https://www.nexusmods.com/witcher3/mods/7154', descricao: 'Pula os vídeos de abertura e os resumos narrados das telas de carregamento.' }
        ]
      }
    ],
    notas: [
      {
        titulo: '⚠️ Atenção: só funciona na versão 4.04',
        texto: 'O pack foi feito pra versão Next-Gen 4.04 do jogo, na Steam ou na GOG.\n\nNo dia 29/09/2026 saiu o The Witcher 3 Remastered (versão 5.00), que atualizou o jogo sozinho pra todo mundo no PC. Vários mods do pack (No Levels, All Quest Objectives On Map e outros) ainda não funcionam no Remastered. A versão antiga Classic (1.32) também não serve.\n\nPra ver a sua versão, abra o jogo: ela aparece no canto do menu principal. Se for 4.04, pode pular direto pro "Como instalar". Se for 5.00, siga os tutoriais abaixo pra voltar pra 4.04.\n\nEpic Games: a Epic não deixa voltar a versão do jogo, então por enquanto o pack não funciona lá.'
      },
      {
        titulo: '💾 Antes de voltar a versão: backup dos saves',
        passos: [
          'Aperte Windows + R.',
          'Clique em "Copiar" abaixo, cole na janelinha e dê Enter.',
          'Copie a pasta "gamesaves" pra Área de Trabalho, um pendrive ou a nuvem.'
        ],
        dica: 'Saves feitos no Remastered (5.00) podem NÃO abrir na 4.04. Saves antigos, de antes do Remastered, funcionam normal.',
        codigo: '%USERPROFILE%\\Documents\\The Witcher 3'
      },
      {
        titulo: '⏪ Voltar para a 4.04 (Steam)',
        passos: [
          'Na Biblioteca da Steam, clique com o botão direito em The Witcher 3: Wild Hunt e vá em Propriedades.',
          'Abra a aba "Betas" (ou "Versões e Betas").',
          'Na lista, escolha a opção "next-gen". NÃO escolha "classic", que é a versão antiga 1.32.',
          'Feche a janela e espere a Steam terminar o download.',
          'Abra o jogo e confira se o menu mostra 4.04.'
        ],
        dica: 'Pra voltar pro Remastered depois, é só fazer o mesmo caminho e escolher "Nenhum".'
      },
      {
        titulo: '⏪ Voltar para a 4.04 (GOG Galaxy)',
        passos: [
          'No GOG Galaxy, clique no The Witcher 3 e depois no ícone de ajustes, ao lado do botão Jogar.',
          'Vá em Gerenciar instalação > Configurar...',
          'Desligue a atualização automática do jogo.',
          'Em "Canais Beta" / "Versão", escolha a versão 4.04 / Next-Gen. Também NÃO escolha "Classic".',
          'Clique em OK, espere o download e confira se o menu do jogo mostra 4.04.'
        ]
      },
      {
        titulo: '📦 Como instalar o Care Package',
        passos: [
          'Baixe o Care Package e extraia o .zip (botão direito > Extrair tudo). Não arraste direto de dentro do .zip.',
          'Abra a pasta do jogo. Steam: botão direito no jogo > Gerenciar > Navegar pelos arquivos locais. GOG: ícone de ajustes > Gerenciar instalação > Mostrar pasta. A pasta certa tem dentro as pastas "bin", "content" e "dlc".',
          'Abra a pasta "ARRASTE ISTO PARA A PASTA DO JOGO" do pack, selecione tudo (Ctrl + A) e arraste pra dentro da pasta do jogo.',
          'Se o Windows perguntar: "Mesclar pastas?" > Sim. "Substituir arquivos?" > Substituir no destino. "Permissão de administrador" > Continuar (marque "Fazer isso para todos os itens").',
          'Pronto, é só abrir o jogo e jogar.'
        ],
        dica: 'O menu do No Decorative Containers fica em Opções > Mods. O tutorial completo também vem no arquivo LEIA-ME dentro do .zip.'
      },
      {
        titulo: '🧹 Já tinha outros mods? / Como desinstalar',
        texto: 'O pack foi montado pra funcionar sozinho: os mods já vêm mesclados entre si (pasta mod0000_MergedFiles). Se você já tinha outros mods, faça backup da sua pasta "mods" antiga e apague ela da pasta do jogo antes de instalar. Misturar com outros mods pode dar erro de script ao abrir o jogo.\n\nPra desinstalar: apague a pasta "mods" e a pasta "dlc\\dlcstackyouritems" de dentro da pasta do jogo. Pra deixar tudo 100% original, use também Propriedades > Arquivos instalados > Verificar integridade dos arquivos (Steam) ou Gerenciar instalação > Verificar / Reparar (GOG).\n\nErro de script ao abrir o jogo? Confira se o jogo está na 4.04 e se não tem outros mods misturados.'
      }
    ]
  }
];
