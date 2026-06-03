import { Star, Trophy, Zap } from 'lucide-react';
import type { BadgeView } from '../../../api/rewards';

type BadgeIconGraphicProps = {
    badge: Pick<BadgeView, 'icon'>;
    size?: 'sm' | 'lg';
};

export function BadgeIconGraphic({ badge, size = 'lg' }: BadgeIconGraphicProps) {
    const className =
        size === 'sm' ? 'w-10 h-10' : 'w-20 h-20 text-yellow-500 drop-shadow-md relative z-10';

    if (badge.icon === 'trophy') {
        return <Trophy className={className} />;
    }
    if (badge.icon === 'zap') {
        return <Zap className={`${className} text-purple-500`} />;
    }
    if (badge.icon === 'star') {
        return <Star className={`${className} text-orange-400`} />;
    }
    return <div className={size === 'sm' ? 'text-3xl opacity-40' : 'text-7xl mb-4 opacity-30'}>❓</div>;
}
