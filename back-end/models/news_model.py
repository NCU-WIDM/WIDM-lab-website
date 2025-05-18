from models.database import *


class News(db.Model, SchemaMixin):
    __tablename__ = 'news'
    title = db.Column(db.String(255))
    sub_title = db.Column(db.String(255))
    content = db.Column(db.Text)
    importance = db.Column(db.Boolean, default=0)
    types = db.Column(db.String(255))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "sub_title": self.sub_title,
            "content": self.content,
            "importance": self.importance,
            "create_time": self.create_time,
            "update_time": self.update_time,
            "types": self.types
        }

