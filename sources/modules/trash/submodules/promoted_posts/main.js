// Продвигаемые посты (promoted posts)
const sub = new ext.SubModule(mod, 'promoted_posts');

sub.init__content = () => {
    if (ext.mode === 2016) {
        ext.events.on_mutation.addListener(() => {
            if (ext.options.trash && ext.options.trash__promoted_posts) {
                mod.drop('.post[data-ad]');
                //FUTURE: #left_box #left_holiday
            }
        });
    }
}
