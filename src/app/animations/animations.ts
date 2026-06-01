import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  stagger,
  keyframes,
  sequence,
  group
} from '@angular/animations';

// ------------------------------------------------------------
// 1. Route Transition Animations (Fade, Slide)
// ------------------------------------------------------------
export const routeFadeAnimation = trigger('routeFadeAnimation', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0 })
    ], { optional: true }),
    sequence([
      query(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ], { optional: true }),
      query(':enter', [
        animate('250ms ease-out', style({ opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);

export const routeSlideAnimation = trigger('routeSlideAnimation', [
  transition('* <=> *', [
    style({ position: 'relative', overflow: 'hidden' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ transform: 'translateY(30px)', opacity: 0 })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(-30px)', opacity: 0 }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);

// ------------------------------------------------------------
// 2. List Animations (Stagger effect for product grids)
// ------------------------------------------------------------
export const listStaggerAnimation = trigger('listStaggerAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(30px)' }),
      stagger('60ms', [
        animate('450ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true }),
    query(':leave', [
      stagger('-40ms', [
        animate('250ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ], { optional: true })
  ])
]);

// ------------------------------------------------------------
// 3. Modal Animations (Scale and Fade)
// ------------------------------------------------------------
export const modalScaleFadeAnimation = trigger('modalScaleFadeAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.94)' }),
    animate('250ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1)' }))
  ]),
  transition(':leave', [
    animate('200ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 0, transform: 'scale(0.94)' }))
  ])
]);

// ------------------------------------------------------------
// 4. Cart Item Animations (Slide in when added)
// ------------------------------------------------------------
export const cartItemSlideAnimation = trigger('cartItemSlideAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('350ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('250ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);

// ------------------------------------------------------------
// 5. Image Gallery Animations (Smooth transitions)
// ------------------------------------------------------------
export const galleryTransitionAnimation = trigger('galleryTransitionAnimation', [
  transition('* => *', [
    style({ opacity: 0, transform: 'scale(0.97)' }),
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1, transform: 'scale(1)' }))
  ])
]);

// ------------------------------------------------------------
// 6. Button Ripple & Interaction Animations
// ------------------------------------------------------------
export const buttonRippleAnimation = trigger('buttonRippleAnimation', [
  state('idle', style({ transform: 'scale(1)' })),
  state('clicked', style({ transform: 'scale(0.95)' })),
  transition('idle <=> clicked', animate('100ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
]);

// ------------------------------------------------------------
// 7. Skeleton Loading Animations
// ------------------------------------------------------------
export const skeletonShimmerAnimation = trigger('skeletonShimmerAnimation', [
  transition('* => *', [
    animate('1.5s infinite ease-in-out', keyframes([
      style({ opacity: 0.4, offset: 0 }),
      style({ opacity: 0.7, offset: 0.5 }),
      style({ opacity: 0.4, offset: 1 })
    ]))
  ])
]);
