var mongoose = require('mongoose')
var idValidator = require('mongoose-id-validator');
var Schema = mongoose.Schema;

module.exports = {
	getValidationHelperModel: function(modelName) {
		
		// A helper schema for validating an array of IDs of the specified model.
		var ValidationHelperSchema = new Schema({
			userIds: [{type: Schema.Types.ObjectId, ref: modelName}]
		});
		
		// Apply the mongoose-id-validator plugin to the helper schema.
		ValidationHelperSchema.plugin(idValidator, {message: 'Invalid ID value for {PATH}}'});
		
		// Generate and return the validation helper model.
		var validationHelperModel = mongoose.model('ValidationHelper', ValidationHelperSchema);
		return validationHelperModel;
	}
};
