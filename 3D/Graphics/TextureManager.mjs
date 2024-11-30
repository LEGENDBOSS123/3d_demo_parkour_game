

var TextureManager = class {

    constructor(options) {
        this.textures = new Map();
        this.loader = options?.loader ?? null;
        this.extraLoaders = options?.extraLoaders ?? {};
        this.texturesDirectory = options?.texturesDirectory ?? new URL('.', import.meta.url).href + "Textures/";
    }

    resolvePath(path) {
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('file://')) {
            return file;
        }
        return new URL(path, this.texturesDirectory).href;
    }

    load(name, file, specialFormat = null) {
        var path = this.resolvePath(file);
        if (specialFormat) {
            for (var extension in this.extraLoaders) {
                if (specialFormat == extension) {
                    this.textures.set(name, this.extraLoaders[extension].load(path));
                    return this.textures.get(name).clone();
                }
            }
        }
        this.textures.set(name, this.loader.load(path));
        return this.textures.get(name).clone();
    }

    loadAll(textures) {
        for (var txt of textures) {
            this.load(txt.name, txt.file, txt.specialFormat ?? null);
        }
    }

    get(name) {
        return this.textures.get(name).clone();
    }
}


export default TextureManager;