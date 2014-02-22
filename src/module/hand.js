var ViewDragger = kity.createClass( "ViewDragger", {
    constructor: function ( minder ) {
        this._minder = minder;
        this._enabled = false;
        this._offset = {
            x: 0,
            y: 0
        };
        this._bind();
    },
    isEnabled: function () {
        return this._enabled;
    },
    setEnabled: function ( value ) {
        var paper = this._minder.getPaper();
        paper.setStyle( 'cursor', value ? 'pointer' : 'default' );
        paper.setStyle( 'cursor', value ? '-webkit-grab' : 'default' );
        this._enabled = value;
    },

    _bind: function () {
        var dragger = this,
            isRootDrag = false,
            startPosition = null,
            lastPosition = null;

        this._minder.on( 'beforemousedown', function ( e ) {

            if ( dragger.isEnabled() ) {
                startPosition = e.getPosition();
                e.stopPropagation();
            } else if ( !this.getRoot().isSelected() && e.getTargetNode() == this.getRoot() ) {
                startPosition = e.getPosition();
                dragger.setEnabled( true );
                isRootDrag = true;
            }

        } ).on( 'beforemousemove', function ( e ) {
            if ( startPosition ) {
                lastPosition = e.getPosition();
                var offset = kity.Vector.fromPoints( startPosition, lastPosition );
                offset = kity.Vector.add( dragger._offset, offset );
                this.getRenderContainer().setTransform( new kity.Matrix().translate( offset.x, offset.y ) );
                e.stopPropagation();
            }
        } ).on( 'mouseup', function ( e ) {
            if ( startPosition && lastPosition ) {
                dragger._offset.x += lastPosition.x - startPosition.x;
                dragger._offset.y += lastPosition.y - startPosition.y;
            }
            startPosition = null;
            if ( isRootDrag ) {
                dragger.setEnabled( false );
                isRootDrag = false;
            }
        } );
    }
} );

KityMinder.registerModule( 'Hand', function () {
    var ToggleHandCommand = kity.createClass( "ToggleHandCommand", {
        base: Command,
        execute: function ( minder ) {
            minder._viewDragger.setEnabled( !minder._viewDragger.isEnabled() );
        },
        queryState: function ( minder ) {
            return minder._viewDragger.isEnabled() ? 1 : 0;
        }
    } );

    return {
        init: function () {
            this._viewDragger = new ViewDragger( this );
        },
        commands: {
            'hand': ToggleHandCommand
        },
        events: {
            keyup: function ( e ) {
                if ( e.originEvent.keyCode == keymap.Spacebar && this.getSelectedNodes().length === 0 ) {
                    this.execCommand( 'hand' );
                    e.preventDefault();
                }
            }
        }
    };
} );