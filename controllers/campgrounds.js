const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


//route設定-index
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

//route設定-new campground
module.exports.renderNewForm = async (req, res) => {
    res.render('campgrounds/new', { cities });
}
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.address,
        limit: 1
    }).send()

    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCampground.author = req.user._id;
    await newCampground.save();
    console.log(newCampground);
    req.flash('success', '完成新增');
    res.redirect(`/campgrounds/${newCampground._id}`);
}

//route設定-detail campground
module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', '找不到營地');
        return res.redirect('/campgrounds');
    };
    res.render('campgrounds/show', { campground });
}

//route設定-edit campground
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campgroundEdit = await Campground.findById(id);
    if (!campgroundEdit) {
        req.flash('error', '找不到營地');
        return res.redirect('/campgrounds');
    };
    console.log(campgroundEdit);
    res.render('campgrounds/edit', { cities, campgroundEdit, id });
}
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', '編輯完成');
    res.redirect(`/campgrounds/${id}`);
}

//route設定-delete campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', '已刪除');
    res.redirect('/campgrounds');
}


